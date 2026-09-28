import { createFileRoute } from "@tanstack/react-router";
import { handleV1DashboardGet } from "#/routes/api/v1/-dashboard-handlers";

export const Route = createFileRoute("/api/v1/dashboard")({
	server: {
		handlers: {
			GET: handleV1DashboardGet,
		},
	},
});
