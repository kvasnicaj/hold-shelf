import type { TagsResponse } from "@hold-shelf/api-contracts";
import type { TagSummaryRecord } from "#/server/tags-service";

export function toApiV1Tags(tags: TagSummaryRecord[]): TagsResponse {
	return tags.map((tag) => ({
		id: tag.id,
		name: tag.name,
		color: tag.color,
		createdAt: tag.createdAt.toISOString(),
		articleCount: tag.articleCount,
	}));
}
