import { createFileRoute } from "@tanstack/react-router";
import { handleApiDocsAgentGet } from "#/routes/api-docs/-agents-handlers";

export const Route = createFileRoute("/api-docs/agents")({
	server: {
		handlers: {
			GET: handleApiDocsAgentGet,
		},
	},
});
