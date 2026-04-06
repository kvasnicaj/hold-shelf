import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { ArticleCollectionPage } from "#/components/articles/article-collection-page";
import { useArticleCollectionPage } from "#/components/articles/use-article-collection-page";

const route = getRouteApi("/app/favorites");

export function FavoritesPage() {
	const initialData = route.useLoaderData();
	const search = route.useSearch();
	const navigate = useNavigate({ from: "/app/favorites" });
	const pageState = useArticleCollectionPage({
		initialData,
		search,
		queryKey: "favorites",
		filters: { isFavorite: true },
		navigate,
	});

	return (
		<ArticleCollectionPage
			{...pageState}
			title="Favorites"
			searchPlaceholder="Search favorites..."
			emptyStateMessage={
				pageState.q
					? "No favorite articles match your search."
					: "No favorite articles yet."
			}
			emptyStateHint={
				pageState.q ? undefined : "Star an article to add it to Favorites."
			}
		/>
	);
}
