import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";
import { ArticleCollectionRoutePage } from "#/components/articles/article-collection-route-page";

const route = getRouteApi("/app/articles");

export function ArticlesPage() {
	const initialData = route.useLoaderData();
	const search = route.useSearch();
	const navigate = useNavigate({ from: "/app/articles" });

	return (
		<ArticleCollectionRoutePage
			initialData={initialData}
			search={search}
			navigate={navigate}
			queryKey="unread"
			filters={{ isRead: false }}
			title="Unread"
			icon={BookOpen}
			searchPlaceholder="Search articles..."
			emptyStateMessage="No unread articles yet."
			filteredEmptyStateMessage="No articles match your search."
			emptyStateHint="Save an article to get started."
		/>
	);
}
