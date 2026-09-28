import { createFileRoute } from "@tanstack/react-router";
import {
	handleV1ArticleDelete,
	handleV1ArticleGet,
	handleV1ArticlePatch,
} from "#/routes/api/v1/-article-handlers";

export const Route = createFileRoute("/api/v1/articles/$id")({
	server: {
		handlers: {
			GET: handleV1ArticleGet,
			PATCH: handleV1ArticlePatch,
			DELETE: handleV1ArticleDelete,
		},
	},
});
