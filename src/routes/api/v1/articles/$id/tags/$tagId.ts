import { createFileRoute } from "@tanstack/react-router";
import {
	handleV1ArticleTagDelete,
	handleV1ArticleTagPut,
} from "#/routes/api/v1/-article-tags-handlers";

export const Route = createFileRoute("/api/v1/articles/$id/tags/$tagId")({
	server: {
		handlers: {
			PUT: handleV1ArticleTagPut,
			DELETE: handleV1ArticleTagDelete,
		},
	},
});
