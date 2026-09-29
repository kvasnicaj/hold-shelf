import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { useAutoMarkReadOnOpen } from "#/components/articles/use-auto-mark-read-on-open";
import {
	getHighlightedParts,
	getSearchPreviewText,
} from "#/components/layout/helpers";
import { ToolBox, ToolBoxInput } from "#/components/layout/tool-box";
import { useDebouncedValue } from "#/hooks/use-debounced-value";
import { getArticles } from "#/server/articles";

export function AppSearch() {
	const [search, setSearch] = useState("");
	const [focused, setFocused] = useState(false);
	const navigate = useNavigate();
	const { handleOpenArticle } = useAutoMarkReadOnOpen();
	const trimmedSearch = search.trim();
	const debouncedSearch = useDebouncedValue(trimmedSearch);
	const showResults = focused && trimmedSearch.length >= 2;
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
		if (trimmedSearch) {
			void navigate({
				to: "/app/archive",
				search: { q: trimmedSearch },
			});
		}
	}

	async function handleResultClick(article: { id: string; isRead: boolean }) {
		setFocused(false);
		await navigate({
			to: "/app/archive",
			search: { q: trimmedSearch },
		});
		await handleOpenArticle(article.id, article.isRead);
	}

	return (
		<form
			onSubmit={handleSubmit}
			onBlur={(event) => {
				if (!event.currentTarget.contains(event.relatedTarget))
					setFocused(false);
			}}
			onKeyDown={(event) => {
				if (event.key === "Escape") setFocused(false);
			}}
			className="relative min-w-0 w-full max-w-2xl"
		>
			<ToolBox className="h-9 min-w-0 w-full gap-2 bg-muted/45 px-3">
				<Search className="h-4 w-4 shrink-0 text-muted-foreground" />
				<ToolBoxInput
					type="search"
					className="min-w-0"
					aria-label="Search all saved articles"
					placeholder="Search all saved articles..."
					value={search}
					onChange={(event) => setSearch(event.target.value)}
					onFocus={() => setFocused(true)}
				/>
			</ToolBox>

			{showResults && (
				<div className="absolute top-full right-0 left-0 z-40 mt-2 overflow-hidden rounded-lg border bg-popover shadow-xl">
					{data?.items.length ? (
						<div className="max-h-96 overflow-y-auto p-1">
							{data.items.map((article) => {
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
										className="flex w-full items-start gap-2 rounded-md px-2.5 py-2 text-left hover:bg-accent"
										onMouseDown={(event) => event.preventDefault()}
										onClick={() => void handleResultClick(article)}
									>
										{article.faviconUrl && (
											<img
												src={article.faviconUrl}
												alt=""
												className="mt-0.5 h-4 w-4 shrink-0"
												onError={(event) => {
													event.currentTarget.style.display = "none";
												}}
											/>
										)}
										<span className="min-w-0 flex-1">
											<span className="block truncate text-sm font-medium">
												{getHighlightedParts(
													article.title ?? article.url,
													trimmedSearch,
												).map((part) =>
													part.match ? (
														<mark
															key={`${part.text}-match`}
															className="rounded bg-primary/20 px-0.5 text-foreground"
														>
															{part.text}
														</mark>
													) : (
														<span key={part.text}>{part.text}</span>
													),
												)}
											</span>
											{preview && (
												<span className="mt-0.5 line-clamp-2 text-xs leading-5 text-muted-foreground">
													{getHighlightedParts(preview, trimmedSearch).map(
														(part) =>
															part.match ? (
																<mark
																	key={`${part.text}-preview-match`}
																	className="rounded bg-primary/20 px-0.5 text-foreground"
																>
																	{part.text}
																</mark>
															) : (
																<span key={part.text}>{part.text}</span>
															),
													)}
												</span>
											)}
										</span>
									</button>
								);
							})}
						</div>
					) : (
						<p className="px-3 py-4 text-center text-sm text-muted-foreground">
							No saved articles match that search.
						</p>
					)}
				</div>
			)}
		</form>
	);
}
