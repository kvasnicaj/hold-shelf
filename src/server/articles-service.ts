import type { articleContentCache, articles } from "#/db/schema";
import type {
	ArticleReaderContent,
	extractArticleContent,
} from "#/server/article-content";
import { extractedArticleToMarkdown } from "#/server/article-markdown";

type ArticleRecord = typeof articles.$inferSelect;
type ArticleContentCacheRecord = typeof articleContentCache.$inferSelect;

const ARTICLE_CONTENT_EXTRACTION_VERSION = "markdown-v3";
const ARTICLE_CONTENT_UNAVAILABLE_RETRY_MS = 86_400_000;

type ArticleTagRecord = {
	id: string;
	name: string;
	color: string | null;
};

type ArticleTagRow = ArticleTagRecord & {
	articleId: string;
};

export type ArticleWithTagsRecord = ArticleRecord & {
	tags: ArticleTagRecord[];
};

export type ArticleSort = "newest" | "oldest" | "title";

export type GetArticlesInput = {
	isRead?: boolean;
	isFavorite?: boolean;
	tagId?: string;
	tagIds?: string[];
	search?: string;
	sort?: ArticleSort;
	limit?: number;
	offset?: number;
};

export type UpdateArticleInput = {
	id: string;
	isRead?: boolean;
	isFavorite?: boolean;
};

export type ArticleMetadataRecord = {
	title: string | null;
	description: string | null;
	faviconUrl: string | null;
	hostname: string;
};

export type ArticleRateLimitResult = {
	allowed: boolean;
	retryAfterMs: number;
};

export class ArticleAlreadyExistsError extends Error {
	readonly articleId: string;
	readonly url: string;

	constructor({ articleId, url }: { articleId: string; url: string }) {
		super("This URL is already in your library.");
		this.name = "ArticleAlreadyExistsError";
		this.articleId = articleId;
		this.url = url;
	}
}

export type ArticleContentCacheUpsert = {
	articleId: string;
	status: "ready" | "unavailable";
	markdown: string | null;
	plainText: string | null;
	wordCount: number | null;
	failureReason: string | null;
	sourceUrl: string;
	extractionVersion: string;
	fetchedAt: Date;
	updatedAt: Date;
};

export type ArticlesRepository = {
	listArticles: (args: {
		userId: string;
		isRead?: boolean;
		isFavorite?: boolean;
		tagId?: string;
		tagIds?: string[];
		search?: string;
		sort: ArticleSort;
		limit: number;
		offset: number;
	}) => Promise<{ rows: ArticleRecord[]; total: number }>;
	listArticleTags: (articleIds: string[]) => Promise<ArticleTagRow[]>;
	getArticleById: (args: {
		userId: string;
		id: string;
	}) => Promise<ArticleRecord | null>;
	findArticleByUrl: (args: {
		userId: string;
		url: string;
	}) => Promise<{ id: string } | null>;
	createArticle: (args: {
		userId: string;
		url: string;
		metadata: ArticleMetadataRecord;
	}) => Promise<ArticleRecord>;
	getArticleContentCache: (
		articleId: string,
	) => Promise<ArticleContentCacheRecord | null>;
	upsertArticleContentCache: (
		data: ArticleContentCacheUpsert,
	) => Promise<ArticleContentCacheRecord>;
	updateArticle: (args: {
		userId: string;
		id: string;
		changes: {
			isRead?: boolean;
			isFavorite?: boolean;
			readAt?: Date | null;
			updatedAt: Date;
		};
	}) => Promise<void>;
	deleteArticles: (args: { userId: string; ids: string[] }) => Promise<void>;
};

export type ArticleReaderRecord = {
	article: ArticleWithTagsRecord;
	content: ArticleReaderContent;
};

export async function getArticlesForUser({
	repo,
	userId,
	data,
}: {
	repo: ArticlesRepository;
	userId: string;
	data: GetArticlesInput;
}): Promise<{ items: ArticleWithTagsRecord[]; total: number }> {
	const sort = data.sort ?? "newest";
	const limit = data.limit ?? 20;
	const offset = data.offset ?? 0;
	const { rows, total } = await repo.listArticles({
		userId,
		isRead: data.isRead,
		isFavorite: data.isFavorite,
		tagId: data.tagId,
		tagIds: data.tagIds,
		search: data.search,
		sort,
		limit,
		offset,
	});

	const articleIds = rows.map((article) => article.id);
	const tagRows =
		articleIds.length > 0 ? await repo.listArticleTags(articleIds) : [];
	const tagsByArticle = new Map<string, ArticleTagRecord[]>();

	for (const row of tagRows) {
		const list = tagsByArticle.get(row.articleId) ?? [];
		list.push({ id: row.id, name: row.name, color: row.color });
		tagsByArticle.set(row.articleId, list);
	}

	return {
		items: rows.map((article) => ({
			...article,
			tags: tagsByArticle.get(article.id) ?? [],
		})),
		total,
	};
}

export async function getArticleReaderForUser({
	repo,
	userId,
	id,
	extractArticleContentFn,
	now = () => new Date(),
	forceRefresh = false,
}: {
	repo: ArticlesRepository;
	userId: string;
	id: string;
	forceRefresh?: boolean;
	extractArticleContentFn: typeof extractArticleContent;
	now?: () => Date;
}): Promise<ArticleReaderRecord> {
	const article = await repo.getArticleById({ userId, id });
	if (!article) {
		throw new Error("Article not found.");
	}

	const content = await getCachedArticleContent({
		repo,
		articleId: article.id,
		sourceUrl: article.url,
		extractArticleContentFn,
		now,
		forceRefresh,
	});
	const latest = await repo.getArticleById({ userId, id });
	const tagRows = await repo.listArticleTags([article.id]);
	if (!latest) throw new Error("Article not found.");

	return {
		article: {
			...latest,
			tags: tagRows.map((tag) => ({
				id: tag.id,
				name: tag.name,
				color: tag.color,
			})),
		},
		content,
	};
}

export async function getCachedArticleContent({
	repo,
	articleId,
	sourceUrl,
	extractArticleContentFn,
	now,
	forceRefresh = false,
}: {
	forceRefresh?: boolean;
	repo: ArticlesRepository;
	articleId: string;
	sourceUrl: string;
	extractArticleContentFn: typeof extractArticleContent;
	now: () => Date;
}): Promise<ArticleReaderContent> {
	const cached = await getArticleContentCacheSafely(repo, articleId);

	if (!forceRefresh && cached && isUsableArticleContentCache(cached, now())) {
		return cacheRecordToReaderContent(cached);
	}

	const fetchedAt = now();
	const extracted = await extractArticleContentFn(sourceUrl);
	if (cached?.status === "ready" && extracted.status === "unavailable")
		return {
			...cacheRecordToReaderContent(cached),
			refreshError: extracted.reason,
		};
	const cacheData = createArticleContentCacheUpsert({
		articleId,
		sourceUrl,
		extracted,
		fetchedAt,
	});

	const cacheRecord = await upsertArticleContentCacheSafely(repo, cacheData);
	return cacheRecord
		? cacheRecordToReaderContent(cacheRecord)
		: cacheRecordToReaderContent(cacheData);
}

async function getArticleContentCacheSafely(
	repo: ArticlesRepository,
	articleId: string,
): Promise<ArticleContentCacheRecord | null> {
	try {
		return await repo.getArticleContentCache(articleId);
	} catch (error) {
		console.warn("Article content cache lookup failed.", {
			articleId,
			error: error instanceof Error ? error.message : String(error),
		});
		return null;
	}
}

async function upsertArticleContentCacheSafely(
	repo: ArticlesRepository,
	data: ArticleContentCacheUpsert,
): Promise<ArticleContentCacheRecord | null> {
	try {
		return await repo.upsertArticleContentCache(data);
	} catch (error) {
		console.warn("Article content cache write failed.", {
			articleId: data.articleId,
			error: error instanceof Error ? error.message : String(error),
		});
		return null;
	}
}

function createArticleContentCacheUpsert({
	articleId,
	sourceUrl,
	extracted,
	fetchedAt,
}: {
	articleId: string;
	sourceUrl: string;
	extracted: Awaited<ReturnType<typeof extractArticleContent>>;
	fetchedAt: Date;
}): ArticleContentCacheUpsert {
	const markdownContent = extractedArticleToMarkdown(extracted);

	return markdownContent
		? {
				articleId,
				status: "ready",
				markdown: markdownContent.markdown,
				plainText: markdownContent.plainText,
				wordCount: markdownContent.wordCount,
				failureReason: null,
				sourceUrl,
				extractionVersion: ARTICLE_CONTENT_EXTRACTION_VERSION,
				fetchedAt,
				updatedAt: fetchedAt,
			}
		: {
				articleId,
				status: "unavailable",
				markdown: null,
				plainText: null,
				wordCount: null,
				failureReason:
					extracted.status === "unavailable"
						? extracted.reason
						: "Hold Shelf could not extract enough readable text.",
				sourceUrl,
				extractionVersion: ARTICLE_CONTENT_EXTRACTION_VERSION,
				fetchedAt,
				updatedAt: fetchedAt,
			};
}

function isUsableArticleContentCache(
	cache: ArticleContentCacheRecord,
	now: Date,
): boolean {
	if (cache.extractionVersion !== ARTICLE_CONTENT_EXTRACTION_VERSION) {
		return false;
	}

	if (cache.status === "ready") {
		return Boolean(cache.markdown && cache.plainText && cache.wordCount);
	}

	return (
		now.getTime() - cache.fetchedAt.getTime() <
		ARTICLE_CONTENT_UNAVAILABLE_RETRY_MS
	);
}

function cacheRecordToReaderContent(
	cache: ArticleContentCacheUpsert,
): ArticleReaderContent {
	if (
		cache.status === "ready" &&
		cache.markdown &&
		cache.plainText &&
		cache.wordCount
	) {
		return {
			status: "ready",
			markdown: cache.markdown,
			plainText: cache.plainText,
			wordCount: cache.wordCount,
			fetchedAt: cache.fetchedAt,
		};
	}

	return {
		status: "unavailable",
		reason: cache.failureReason ?? "The article could not be loaded.",
	};
}

export async function createArticleForUser({
	repo,
	userId,
	url,
	checkRateLimitFn,
	extractMetadataFn,
}: {
	repo: ArticlesRepository;
	userId: string;
	url: string;
	checkRateLimitFn: (
		config: { name: string; windowMs: number; max: number },
		key: string,
	) => Promise<ArticleRateLimitResult>;
	extractMetadataFn: (url: string) => Promise<ArticleMetadataRecord>;
}): Promise<ArticleRecord> {
	const { allowed } = await checkRateLimitFn(
		{ name: "create-article", windowMs: 60_000, max: 30 },
		userId,
	);
	if (!allowed) {
		throw new Error("Rate limit exceeded. Please try again later.");
	}

	const existing = await repo.findArticleByUrl({ userId, url });
	if (existing) {
		throw new ArticleAlreadyExistsError({ articleId: existing.id, url });
	}

	const metadata = await extractMetadataFn(url);
	return repo.createArticle({ userId, url, metadata });
}

export async function updateArticleForUser({
	repo,
	userId,
	data,
	now = () => new Date(),
}: {
	repo: ArticlesRepository;
	userId: string;
	data: UpdateArticleInput;
	now?: () => Date;
}) {
	const article = await repo.getArticleById({ userId, id: data.id });
	if (!article) {
		throw new Error("Article not found.");
	}

	const timestamp = now();
	const changes: {
		isRead?: boolean;
		isFavorite?: boolean;
		readAt?: Date | null;
		updatedAt: Date;
	} = {
		updatedAt: timestamp,
	};

	if (data.isRead !== undefined) {
		changes.isRead = data.isRead;
		changes.readAt = data.isRead ? timestamp : null;
	}

	if (data.isFavorite !== undefined) {
		changes.isFavorite = data.isFavorite;
	}

	await repo.updateArticle({ userId, id: data.id, changes });
	return { success: true };
}

export async function deleteArticleForUser({
	repo,
	userId,
	id,
}: {
	repo: ArticlesRepository;
	userId: string;
	id: string;
}) {
	const article = await repo.getArticleById({ userId, id });
	if (!article) {
		throw new Error("Article not found.");
	}

	return deleteArticlesForUser({ repo, userId, ids: [id] });
}

export async function deleteArticlesForUser({
	repo,
	userId,
	ids,
}: {
	repo: ArticlesRepository;
	userId: string;
	ids: string[];
}) {
	await repo.deleteArticles({ userId, ids });
	return { success: true };
}
