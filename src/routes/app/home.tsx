import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "#/components/home/home-page";
import { getDashboardStats, getRecentArticles } from "#/server/dashboard";

export const Route = createFileRoute("/app/home")({
	loader: async () => {
		const [stats, recent] = await Promise.all([
			getDashboardStats(),
			getRecentArticles(),
		]);
		return { stats, recent };
	},
	component: HomePage,
});
