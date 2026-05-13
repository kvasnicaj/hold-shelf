import { createFileRoute } from "@tanstack/react-router";
import {
	handleV1ArticlesGet,
	handleV1ArticlesPost,
} from "#/routes/api/v1/-articles-handlers";

export const Route = createFileRoute("/api/v1/articles")({
	server: {
		handlers: {
			GET: handleV1ArticlesGet,
			POST: handleV1ArticlesPost,
		},
	},
});
