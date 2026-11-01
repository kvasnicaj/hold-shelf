import { ArrowRight, MagnifyingGlass, X } from "@phosphor-icons/react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useOpenArticle } from "#/components/articles/use-open-article";
import {
	getMatchCountLabel,
	getSearchPreviewText,
} from "#/components/search/helpers";
import { SearchResultItem } from "#/components/search/search-result-item";
import { Button } from "#/components/ui/button";
import { useDebouncedValue } from "#/hooks/use-debounced-value";
import { cn } from "#/lib/utils";
import { getArticles } from "#/server/articles";

type SearchPanelProps = {
	/** Called after the panel navigated or opened an article. */
	onDone?: () => void;
	/** Shows a close button; the dialog passes its own close. */
	onClose?: () => void;
};

export function SearchPanel({ onDone, onClose }: SearchPanelProps) {
	const [search, setSearch] = useState("");
	const navigate = useNavigate();
	const { handleOpenArticle } = useOpenArticle();
	const trimmedSearch = search.trim();
	const debouncedSearch = useDebouncedValue(trimmedSearch);
	const showResults = trimmedSearch.length >= 2;
	const { data, isError, isFetching, isPlaceholderData, refetch } = useQuery({
		queryKey: ["articles", "top-search", debouncedSearch],
		queryFn: () =>
			getArticles({
				data: {
					search: debouncedSearch,
					limit: 6,
				},
			}),
		enabled: showResults && debouncedSearch.length >= 2,
		// Keep the last results on screen while the next search runs.
		placeholderData: keepPreviousData,
	});
	// Results describe the typed query only once its own request has finished.
	const settled =
		debouncedSearch === trimmedSearch && !isFetching && !isPlaceholderData;
	const items = data?.items ?? [];

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
			<div className="flex items-center gap-3 py-2 pr-2 pl-5">
				<label
					htmlFor="app-search"
					className="flex min-w-0 flex-1 items-center gap-3 py-2"
				>
					<MagnifyingGlass className="size-5 shrink-0 text-muted-foreground" />
					<span className="sr-only">Search all saved articles</span>
					<input
						id="app-search"
						type="search"
						autoComplete="off"
						enterKeyHint="search"
						placeholder="Search all saved articles..."
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						className="min-w-0 flex-1 bg-transparent text-lg font-medium outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
					/>
				</label>
				{onClose && (
					<Button
						type="button"
						variant="ghost"
						size="icon-sm"
						className="pointer-coarse:size-11"
						aria-label="Close search"
						onClick={onClose}
					>
						<X className="size-5" />
					</Button>
				)}
			</div>

			{showResults && (
				<div
					className="max-h-[40dvh] overflow-y-auto border-t p-1.5 sm:max-h-[min(60vh,28rem)]"
					aria-busy={!settled}
				>
					{isError && settled ? (
						<div
							role="alert"
							className="space-y-2 px-3 py-4 text-center text-sm"
						>
							<p>Search could not reach your library.</p>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => void refetch()}
							>
								Try again
							</Button>
						</div>
					) : items.length > 0 ? (
						<div className={cn("transition-opacity", !settled && "opacity-60")}>
							{items.map((article) => (
								<SearchResultItem
									key={article.id}
									title={article.title ?? article.url}
									preview={getSearchPreviewText({
										title: article.title,
										description: article.description,
										url: article.url,
										hostname: article.hostname,
										matchExcerpt: article.matchExcerpt,
										query: trimmedSearch,
									})}
									faviconUrl={article.faviconUrl}
									query={trimmedSearch}
									onSelect={() => void handleResultClick(article)}
								/>
							))}
						</div>
					) : settled && data ? (
						<p className="px-3 py-4 text-center text-sm text-muted-foreground">
							No saved articles match “{trimmedSearch}”.
						</p>
					) : null}
					<p
						role="status"
						className={cn(
							"px-3 py-2 text-center text-meta text-muted-foreground",
							settled && "sr-only",
						)}
					>
						{settled ? getMatchCountLabel(data?.total ?? 0) : "Searching…"}
					</p>
				</div>
			)}

			<div className="flex items-center gap-3 border-t bg-background px-3 py-2 sm:px-5">
				<p className="mr-auto hidden items-center gap-3 text-xs text-muted-foreground sm:flex pointer-coarse:hidden">
					<span>
						<kbd>↵</kbd> Search the Library
					</span>
					<span>
						<kbd>Esc</kbd> Close
					</span>
				</p>
				<Button
					type="submit"
					variant="ghost"
					size="sm"
					disabled={!trimmedSearch}
					className="ml-auto h-10 w-full justify-between sm:h-8 sm:w-auto pointer-coarse:h-10"
				>
					{trimmedSearch
						? "Show all matches in Library"
						: "Type to search the Library"}
					<ArrowRight />
				</Button>
			</div>
		</form>
	);
}
