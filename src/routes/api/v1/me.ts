import { createFileRoute } from "@tanstack/react-router";
import { handleV1MeGet } from "#/routes/api/v1/-me-handlers";

export const Route = createFileRoute("/api/v1/me")({
	server: {
		handlers: {
			GET: handleV1MeGet,
		},
	},
});
