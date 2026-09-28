import { createFileRoute } from "@tanstack/react-router";
import { handleV1TagsGet } from "#/routes/api/v1/-tags-handlers";

export const Route = createFileRoute("/api/v1/tags")({
	server: {
		handlers: {
			GET: handleV1TagsGet,
		},
	},
});
