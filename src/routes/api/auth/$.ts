import { createFileRoute } from "@tanstack/react-router";
import { handleAuthGet, handleAuthPost } from "#/routes/api/auth/-handlers";

export const Route = createFileRoute("/api/auth/$")({
	server: {
		handlers: {
			GET: handleAuthGet,
			POST: handleAuthPost,
		},
	},
});
