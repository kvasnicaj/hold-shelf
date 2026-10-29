import { MagnifyingGlass } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useOpenArticle } from "#/components/articles/use-open-article";
import { getSearchPreviewText } from "#/components/search/helpers";
import { HighlightedText } from "#/components/search/highlighted-text";
import { useDebouncedValue } from "#/hooks/use-debounced-value";
import { getArticles } from "#/server/articles";

type SearchPanelProps = {
	/** Called after the panel navigated or opened an article. */
	onDone?: () => void;
};

export function SearchPanel({ onDone }: SearchPanelProps) {
	const [search, setSearch] = useState("");
	const navigate = useNavigate();
	const { handleOpenArticle } = useOpenArticle();
	const trimmedSearch = search.trim();
	const debouncedSearch = useDebouncedValue(trimmedSearch);
	const showResults = trimmedSearch.length >= 2;
	const { data } = useQuery({
		queryKey: ["articles", "top-search", debouncedSearch],
		queryFn: () =>
			getArticles({
				data: {
					search: debouncedSearch,
					limit: 6,
				},
			}),
		enabled: showResults && debouncedSearch.length >= 2,
	});

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!trimmedSearch) return;
		void navigate({
			to: "/app/archive",
			search: { q: trimmedSearch },
		});
		onDone?.();
	}

	async function handleResultClick(article: { id: string; isRead: boolean }) {
		onDone?.();
		await navigate({
			to: "/app/archive",
			search: { q: trimmedSearch },
		});
		await handleOpenArticle(article.id, article.isRead);
	}

	return (
		<form onSubmit={handleSubmit}>
			<label htmlFor="app-search" className="flex items-center gap-3 px-5 py-4">
				<MagnifyingGlass className="size-5 shrink-0 text-mark" />
				<span className="sr-only">Search all saved articles</span>
				<input
					id="app-search"
					type="search"
					autoComplete="off"
					placeholder="Search all saved articles..."
					value={search}
					onChange={(event) => setSearch(event.target.value)}
					className="min-w-0 flex-1 bg-transparent text-lg font-medium outline-none placeholder:text-faint-foreground"
				/>
			</label>

			{showResults && (
				<div className="max-h-[min(60vh,28rem)] overflow-y-auto border-t p-1.5">
					{data?.items.length ? (
						data.items.map((article) => {
							const preview = getSearchPreviewText({
								title: article.title,
								description: article.description,
								url: article.url,
								hostname: article.hostname,
								query: trimmedSearch,
							});
							return (
								<button
									type="button"
									key={article.id}
									className="flex w-full items-start gap-2.5 rounded-md px-3 py-2.5 text-left hover:bg-accent focus-visible:bg-accent"
									onClick={() => void handleResultClick(article)}
								>
									{article.faviconUrl && (
										<img
											src={article.faviconUrl}
											alt=""
											className="mt-0.5 size-4 shrink-0 rounded-[3px]"
											onError={(event) => {
												event.currentTarget.style.display = "none";
											}}
										/>
									)}
									<span className="min-w-0 flex-1">
										<span className="block truncate text-sm font-semibold">
											<HighlightedText
												text={article.title ?? article.url}
												query={trimmedSearch}
											/>
										</span>
										{preview && (
											<span className="mt-0.5 line-clamp-2 text-xs leading-5 text-muted-foreground">
												<HighlightedText text={preview} query={trimmedSearch} />
											</span>
										)}
									</span>
								</button>
							);
						})
					) : (
						<p className="px-3 py-4 text-center text-sm text-muted-foreground">
							No saved articles match that search.
						</p>
					)}
				</div>
			)}

			<div className="flex items-center gap-3 border-t bg-background px-5 py-2.5 text-xs text-muted-foreground">
				<span>
					<kbd>↵</kbd> Search the Library
				</span>
				<span>
					<kbd>Esc</kbd> Close
				</span>
			</div>
		</form>
	);
}
