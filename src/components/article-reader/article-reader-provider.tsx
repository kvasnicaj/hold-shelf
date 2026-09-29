import { useNavigate, useRouterState } from "@tanstack/react-router";
import { articleIdFromHash } from "#/components/article-reader/helpers";
import { ArticleReaderContext } from "#/components/article-reader/use-article-reader";

type ArticleReaderProviderProps = { children: React.ReactNode };
export function ArticleReaderProvider({
	children,
}: ArticleReaderProviderProps) {
	const hash = useRouterState({ select: (state) => state.location.hash });
	const navigate = useNavigate();
	const articleId = articleIdFromHash(hash);
	return (
		<ArticleReaderContext.Provider
			value={{
				articleId,
				isOpen: Boolean(articleId),
				openArticle: (id) => {
					void navigate({
						hash: `article=${encodeURIComponent(id)}`,
						search: true,
					});
				},
				closeArticle: () => {
					void navigate({ hash: "", search: true });
				},
			}}
		>
			{children}
		</ArticleReaderContext.Provider>
	);
}
