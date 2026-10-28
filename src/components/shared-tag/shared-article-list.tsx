import { SharedArticleCard } from "#/components/shared-tag/shared-article-card";
import type { SharedArticle } from "#/components/shared-tag/types";

type SharedArticleListProps = {
	articles: SharedArticle[];
};

export function SharedArticleList({ articles }: SharedArticleListProps) {
	return (
		<div className="divide-y border-y">
			{articles.map((article) => (
				<SharedArticleCard key={article.url} article={article} />
			))}
		</div>
	);
}
