import type {
	Article,
	ArticleListResponse,
	ArticleReaderResponse,
} from "@hold-shelf/api-contracts";
import type {
	ArticleReaderRecord,
	ArticleWithTagsRecord,
} from "#/server/articles-service";

export function toApiV1Article(article: ArticleWithTagsRecord): Article {
	return {
		id: article.id,
		url: article.url,
		title: article.title,
		description: article.description,
		hostname: article.hostname,
		faviconUrl: article.faviconUrl,
		isRead: article.isRead,
		isFavorite: article.isFavorite,
		createdAt: article.createdAt.toISOString(),
		updatedAt: article.updatedAt.toISOString(),
		readAt: article.readAt?.toISOString() ?? null,
		tags: article.tags.map((tag) => ({
			id: tag.id,
			name: tag.name,
			color: tag.color,
		})),
	};
}

export function toApiV1ArticleList({
	items,
	total,
}: {
	items: ArticleWithTagsRecord[];
	total: number;
}): ArticleListResponse {
	return {
		items: items.map(toApiV1Article),
		total,
	};
}

export function toApiV1ArticleReader(
	reader: ArticleReaderRecord,
): ArticleReaderResponse {
	return {
		article: toApiV1Article(reader.article),
		content:
			reader.content.status === "ready"
				? {
						...reader.content,
						fetchedAt: reader.content.fetchedAt.toISOString(),
					}
				: reader.content,
	};
}
