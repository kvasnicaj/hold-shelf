import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "#/components/home/home-page";
import { getDashboardStats, getRecentArticles } from "#/server/dashboard";
import { getTags } from "#/server/tags";

export const Route = createFileRoute("/app/home")({
	loader: async () => {
		const [stats, recent, tags] = await Promise.all([
			getDashboardStats(),
			getRecentArticles(),
			getTags(),
		]);
		return { stats, recent, tags };
	},
	component: HomePage,
});
