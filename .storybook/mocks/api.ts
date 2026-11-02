import { fn } from "storybook/test";
import type {
	GetArticlesInput,
	UpdateArticleInput,
} from "#/server/articles-service";
import type { BackupArticle, DeleteTrashInput } from "#/server/library-schemas";
import {
	sampleArticles,
	sampleContinueReading,
	sampleDate,
	sampleReader,
	sampleShare,
	sampleTags,
	sampleToken,
	sampleTrash,
} from "#/stories/fixtures";
import type { MockScenario } from "./types";

let scenario: MockScenario = "default";
let articles = structuredClone(sampleArticles);
let tags = structuredClone(sampleTags);
let trash = structuredClone(sampleTrash);
let share: typeof sampleShare | null = null;
let token: typeof sampleToken | null = null;
let nextArticleId = 1;
let nextTagId = 1;
const progress = new Map<string, number>();

export function resetMockApi(nextScenario: MockScenario = "default") {
	scenario = nextScenario;
	articles = nextScenario === "empty" ? [] : structuredClone(sampleArticles);
	tags = nextScenario === "empty" ? [] : structuredClone(sampleTags);
	trash = nextScenario === "empty" ? [] : structuredClone(sampleTrash);
	share = nextScenario === "token" ? structuredClone(sampleShare) : null;
	token = nextScenario === "token" ? structuredClone(sampleToken) : null;
	nextArticleId = 1;
	nextTagId = 1;
	progress.clear();
}

export function getMockHomeData() {
	const unread = articles.filter((article) => !article.isRead);
	return structuredClone({
		stats: {
			unread: unread.length,
			total: articles.length,
			readThisWeek: articles.length - unread.length,
			savedThisWeek: articles.length,
		},
		recent: {
			recentlySaved: articles.slice(0, 5),
			recentlyFavorite: articles
				.filter((article) => article.isFavorite)
				.slice(0, 5),
			oldestUnread: [...unread]
				.sort(
					(left, right) => left.createdAt.getTime() - right.createdAt.getTime(),
				)
				.slice(0, 5),
		},
		tags: tags.map((tag) => ({
			...tag,
			articleCount: articles.filter((article) =>
				article.tags.some((assigned) => assigned.id === tag.id),
			).length,
		})),
		continueReading: sampleContinueReading.filter((entry) =>
			unread.some((article) => article.id === entry.id),
		),
	});
}

async function respond<T>(result: T): Promise<T> {
	if (scenario === "error")
		throw new Error("The demo request failed. Please try again.");
	if (scenario === "loading") return new Promise<T>(() => {});
	return structuredClone(result);
}

export function listSampleArticles(data: GetArticlesInput = {}) {
	let items = articles.filter(
		(article) =>
			(data.isRead === undefined || article.isRead === data.isRead) &&
			(data.isFavorite === undefined ||
				article.isFavorite === data.isFavorite) &&
			(!data.tagId || article.tags.some((tag) => tag.id === data.tagId)) &&
			(!data.tagIds?.length ||
				data.tagIds.every((id) => article.tags.some((tag) => tag.id === id))) &&
			(!data.search ||
				`${article.title} ${article.description} ${article.hostname} ${sampleReader.content.status === "ready" ? sampleReader.content.plainText : ""}`
					.toLowerCase()
					.includes(data.search.toLowerCase())),
	);
	if (data.sort === "title")
		items = [...items].sort((a, b) =>
			(a.title ?? a.url).localeCompare(b.title ?? b.url),
		);
	else
		items = [...items].sort(
			(a, b) =>
				(a.createdAt.getTime() - b.createdAt.getTime()) *
				(data.sort === "oldest" ? 1 : -1),
		);
	return {
		items: items.slice(
			data.offset ?? 0,
			(data.offset ?? 0) + (data.limit ?? 20),
		),
		total: items.length,
	};
}

export const getArticles = fn(
	async ({ data = {} }: { data?: GetArticlesInput } = {}) =>
		respond(listSampleArticles(data)),
);
export const getTags = fn(async () => respond(getMockHomeData().tags));
export const getArticleReader = fn(async ({ data }: { data: { id: string } }) =>
	respond({
		...sampleReader,
		article:
			articles.find((article) => article.id === data.id) ??
			sampleReader.article,
		content:
			scenario === "unavailable"
				? {
						status: "unavailable" as const,
						reason: "The publisher only provides an article preview.",
					}
				: sampleReader.content,
	}),
);
export const refreshArticleContent = getArticleReader;
export const createArticle = fn(async ({ data }: { data: { url: string } }) => {
	if (scenario === "duplicate")
		throw new Error("This URL is already in your library.");
	const article = {
		...structuredClone(sampleArticles[0]),
		id: `demo-article-${nextArticleId++}`,
		url: data.url,
		title: "Your saved demo article",
		hostname: new URL(data.url).hostname,
		isRead: false,
		isFavorite: false,
		readAt: null,
		tags: [],
	};
	await respond(null);
	articles.unshift(article);
	return article;
});
export const updateArticle = fn(
	async ({ data }: { data: UpdateArticleInput }) => {
		await respond(null);
		articles = articles.map((article) =>
			article.id === data.id ? { ...article, ...data } : article,
		);
		return (
			articles.find((article) => article.id === data.id) ?? sampleArticles[0]
		);
	},
);
export const deleteArticles = fn(
	async ({ data }: { data: { ids: string[] } }) => {
		await respond(null);
		trash.push(...articles.filter((article) => data.ids.includes(article.id)));
		articles = articles.filter((article) => !data.ids.includes(article.id));
		return { success: true };
	},
);
export const createTag = fn(async ({ data }: { data: { name: string } }) => {
	await respond(null);
	const tag = {
		id: `demo-tag-${nextTagId++}`,
		name: data.name,
		color: null,
		articleCount: 0,
	};
	tags.push(tag);
	return tag;
});
export const updateTag = fn(
	async ({ data }: { data: { id: string; name: string } }) => {
		await respond(null);
		tags = tags.map((tag) =>
			tag.id === data.id ? { ...tag, name: data.name } : tag,
		);
		articles = articles.map((article) => ({
			...article,
			tags: article.tags.map((tag) =>
				tag.id === data.id ? { ...tag, name: data.name } : tag,
			),
		}));
		return tags.find((tag) => tag.id === data.id);
	},
);
export const deleteTag = fn(async ({ data }: { data: { id: string } }) => {
	await respond(null);
	tags = tags.filter((tag) => tag.id !== data.id);
	articles = articles.map((article) => ({
		...article,
		tags: article.tags.filter((tag) => tag.id !== data.id),
	}));
	return { success: true };
});
export const addTagToArticles = fn(
	async ({ data }: { data: { tagId: string; articleIds: string[] } }) => {
		await respond(null);
		const tag = tags.find((tag) => tag.id === data.tagId);
		if (tag)
			articles = articles.map((article) =>
				data.articleIds.includes(article.id) &&
				!article.tags.some((existing) => existing.id === tag.id)
					? { ...article, tags: [...article.tags, tag] }
					: article,
			);
		return { success: true };
	},
);
export const removeTagFromArticles = fn(
	async ({ data }: { data: { tagId: string; articleIds: string[] } }) => {
		await respond(null);
		articles = articles.map((article) =>
			data.articleIds.includes(article.id)
				? {
						...article,
						tags: article.tags.filter((tag) => tag.id !== data.tagId),
					}
				: article,
		);
		return { success: true };
	},
);
export const getTrash = fn(async () =>
	respond(trash.map((article) => ({ ...article, deletedAt: sampleDate }))),
);
export const restoreArticles = fn(
	async ({ data }: { data: { ids: string[] } }) => {
		await respond(null);
		articles.push(...trash.filter((article) => data.ids.includes(article.id)));
		trash = trash.filter((article) => !data.ids.includes(article.id));
		return { success: true };
	},
);
export const permanentlyDeleteTrash = fn(
	async ({ data }: { data: DeleteTrashInput }) => {
		await respond(null);
		trash =
			data.mode === "all"
				? []
				: trash.filter((article) => !data.ids.includes(article.id));
		return { success: true };
	},
);
export const getContinueReading = fn(async () =>
	respond(
		scenario === "empty"
			? []
			: sampleContinueReading.filter((entry) =>
					articles.some(
						(article) => article.id === entry.id && !article.isRead,
					),
				),
	),
);
export const getReadingProgress = fn(
	async ({ data }: { data: { id: string } }) =>
		respond(progress.get(data.id) ?? 0),
);
export const saveReadingProgress = fn(
	async ({ data }: { data: { id: string; progress: number } }) => {
		await respond(null);
		progress.set(data.id, data.progress);
		return { success: true };
	},
);
export const finishReading = fn(async ({ data }: { data: { id: string } }) =>
	updateArticle({ data: { id: data.id, isRead: true } }),
);
export const getDashboardStats = fn(async () =>
	respond(getMockHomeData().stats),
);
export const getRecentArticles = fn(async () =>
	respond(getMockHomeData().recent),
);
export const getTagShare = fn(async () => respond(share));
export const createTagShare = fn(async () => {
	await respond(null);
	share = structuredClone(sampleShare);
	return share;
});
export const revokeTagShare = fn(async () => {
	await respond(null);
	share = null;
	return { success: true };
});
export const getApiToken = fn(async () => respond(token));
export const generateApiToken = fn(async () => {
	await respond(null);
	token = structuredClone(sampleToken);
	return { ...token, token: "hs_storybook_synthetic_example_only" };
});
export const revokeApiToken = fn(async () => {
	await respond(null);
	token = null;
	return { success: true };
});
export const exportLibraryPage = fn(
	async ({ data }: { data: { offset: number } }) => {
		const entries: BackupArticle[] = [...articles, ...trash].map((article) => ({
			url: article.url,
			title: article.title,
			description: article.description,
			faviconUrl: article.faviconUrl,
			isRead: article.isRead,
			isFavorite: article.isFavorite,
			createdAt: article.createdAt.toISOString(),
			readAt: article.readAt?.toISOString() ?? null,
			tags: article.tags.map(({ name, color }) => ({ name, color })),
			content: null,
			progress: progress.get(article.id) ?? 0,
			trashed: trash.some((entry) => entry.id === article.id),
		}));
		return respond(entries.slice(data.offset, data.offset + 25));
	},
);
export const importLibraryBatch = fn(
	async ({ data }: { data: BackupArticle[] }) => {
		await respond(null);
		let imported = 0;
		for (const entry of data) {
			if ([...articles, ...trash].some((article) => article.url === entry.url))
				continue;
			const article = {
				...structuredClone(sampleArticles[0]),
				...entry,
				id: `demo-article-${nextArticleId++}`,
				hostname: new URL(entry.url).hostname,
				createdAt: new Date(entry.createdAt),
				readAt: entry.readAt ? new Date(entry.readAt) : null,
				tags: entry.tags.map((entryTag) => {
					let tag = tags.find((tag) => tag.name === entryTag.name);
					if (!tag) {
						tag = {
							...entryTag,
							id: `demo-tag-${nextTagId++}`,
							articleCount: 0,
						};
						tags.push(tag);
					}
					return tag;
				}),
			};
			(entry.trashed ? trash : articles).push(article);
			progress.set(article.id, entry.progress);
			imported += 1;
		}
		return { imported, skipped: data.length - imported };
	},
);
