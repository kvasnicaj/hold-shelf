import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { ArticleCollectionRoutePage } from "#/components/articles/article-collection-route-page";

const route = getRouteApi("/app/favorites");

export function FavoritesPage() {
	const initialData = route.useLoaderData();
	const search = route.useSearch();
	const navigate = useNavigate({ from: "/app/favorites" });

	return (
		<ArticleCollectionRoutePage
			initialData={initialData}
			search={search}
			navigate={navigate}
			queryKey="favorites"
			filters={{ isFavorite: true }}
			title="Favorites"
			searchPlaceholder="Search favorites..."
			emptyStateMessage="No favorite articles yet."
			filteredEmptyStateMessage="No favorite articles match your search."
			emptyStateHint="Bookmark an article to add it to Favorites."
		/>
	);
}
