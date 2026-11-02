import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "#/components/home/home-page";
import { continueReadingOptions } from "#/components/home/query-options";
import { getDashboardStats, getRecentArticles } from "#/server/dashboard";
import { getTags } from "#/server/tags";

export const Route = createFileRoute("/app/home")({
	loader: async ({ context }) => {
		const [stats, recent, tags, continueReading] = await Promise.all([
			getDashboardStats(),
			getRecentArticles(),
			getTags(),
			context.queryClient.fetchQuery(continueReadingOptions()),
		]);
		return { stats, recent, tags, continueReading };
	},
	component: HomePage,
});
