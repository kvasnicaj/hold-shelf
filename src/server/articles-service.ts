import type { articles } from "#/db/schema";

type ArticleRecord = typeof articles.$inferSelect;

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

export type ArticlesRepository = {
	listArticles: (args: {
		userId: string;
		isRead?: boolean;
		isFavorite?: boolean;
		tagId?: string;
		search?: string;
		sort: ArticleSort;
		limit: number;
		offset: number;
	}) => Promise<{ rows: ArticleRecord[]; total: number }>;
	listArticleTags: (articleIds: string[]) => Promise<ArticleTagRow[]>;
	findArticleByUrl: (args: {
		userId: string;
		url: string;
	}) => Promise<{ id: string } | null>;
	createArticle: (args: {
		userId: string;
		url: string;
		metadata: ArticleMetadataRecord;
	}) => Promise<ArticleRecord>;
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
		throw new Error("This URL is already in your library.");
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
