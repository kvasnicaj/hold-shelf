import { createFileRoute } from "@tanstack/react-router";
import {
	handleExtensionArticlesOptions,
	handleExtensionArticlesPost,
} from "#/routes/api/extension/-articles-handlers";

export const Route = createFileRoute("/api/extension/articles")({
	server: {
		handlers: {
			OPTIONS: handleExtensionArticlesOptions,
			POST: handleExtensionArticlesPost,
		},
	},
});
