import type { LucideIcon } from "lucide-react";
import { ArticleCollectionPage } from "#/components/articles/article-collection-page";
import type {
	ArticleCollectionFilters,
	ArticleCollectionLoaderData,
	ArticleCollectionNavigate,
	ArticleCollectionQueryKey,
	ArticleCollectionSearch,
} from "#/components/articles/types";
import { useArticleCollectionPage } from "#/components/articles/use-article-collection-page";

type ArticleCollectionRoutePageProps = {
	initialData: ArticleCollectionLoaderData;
	search: ArticleCollectionSearch;
	navigate: ArticleCollectionNavigate;
	queryKey: ArticleCollectionQueryKey;
	filters: ArticleCollectionFilters;
	title: string;
	icon: LucideIcon;
	searchPlaceholder: string;
	emptyStateMessage: string;
	filteredEmptyStateMessage: string;
	emptyStateHint: string;
};

export function ArticleCollectionRoutePage({
	initialData,
	search,
	navigate,
	queryKey,
	filters,
	title,
	icon,
	searchPlaceholder,
	emptyStateMessage,
	filteredEmptyStateMessage,
	emptyStateHint,
}: ArticleCollectionRoutePageProps) {
	const pageState = useArticleCollectionPage({
		initialData,
		search,
		queryKey,
		filters,
		navigate,
	});

	return (
		<ArticleCollectionPage
			{...pageState}
			title={title}
			icon={icon}
			searchPlaceholder={searchPlaceholder}
			emptyStateMessage={
				pageState.q ? filteredEmptyStateMessage : emptyStateMessage
			}
			emptyStateHint={pageState.q ? undefined : emptyStateHint}
		/>
	);
}
