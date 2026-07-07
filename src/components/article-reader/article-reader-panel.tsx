import { useQuery } from "@tanstack/react-query";
import { BookOpen, Check, ExternalLink, Star, X } from "lucide-react";
import { ArticleReaderContent } from "#/components/article-reader/article-reader-content";
import { ArticleReaderFallback } from "#/components/article-reader/article-reader-fallback";
import { ArticleReaderMetadata } from "#/components/article-reader/article-reader-metadata";
import { useArticleReader } from "#/components/article-reader/use-article-reader";
import { useArticleMutations } from "#/components/articles/use-article-mutations";
import { ColumnNavbar } from "#/components/layout/column-navbar";
import { TagPicker } from "#/components/tags/tag-picker";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Skeleton } from "#/components/ui/skeleton";
import { cn } from "#/lib/utils";
import { getArticleReader } from "#/server/articles";
import { getTags } from "#/server/tags";

export function ArticleReaderPanel() {
	const { articleId, isOpen, closeArticle } = useArticleReader();
	const { data: tagList = [] } = useQuery({
		queryKey: ["tags"],
		queryFn: () => getTags(),
	});
	const { data, isLoading, isError } = useQuery({
		queryKey: ["article-reader", articleId],
		queryFn: () => getArticleReader({ data: { id: articleId ?? "" } }),
		enabled: Boolean(articleId),
	});
	const {
		handleToggleRead,
		handleToggleFavorite,
		handleAddTag,
		handleRemoveTag,
		handleCreateTag,
	} = useArticleMutations({
		extraInvalidationKeys: articleId ? [["article-reader", articleId]] : [],
		invalidateRouter: false,
	});

	function renderCloseButton(key: string) {
		return (
			<Button
				key={key}
				variant="ghost"
				size="icon-sm"
				onClick={closeArticle}
				title="Close reader"
				aria-label="Close reader"
			>
				<X className="h-[1.125rem] w-[1.125rem]" />
			</Button>
		);
	}

	return (
		<aside
			className={cn(
				"fixed inset-y-0 right-0 left-0 z-50 h-screen shrink-0 border-l bg-background transition-transform duration-200 md:left-56 2xl:static 2xl:z-auto 2xl:transition-[width]",
				isOpen
					? "translate-x-0 2xl:w-[clamp(34rem,38vw,52rem)]"
					: "pointer-events-none translate-x-full border-l-0 2xl:w-0 2xl:translate-x-0",
			)}
			aria-label="Article reader"
			aria-hidden={!isOpen}
			inert={!isOpen}
		>
			<div className="flex h-full min-w-full flex-col 2xl:min-w-[clamp(34rem,38vw,52rem)]">
				<ColumnNavbar
					aria-label="Article reader navigation"
					right={
						data?.article
							? [
									<TagPicker
										key="tags"
										availableTags={tagList}
										selectedTagIds={data.article.tags.map((tag) => tag.id)}
										onAddTag={handleAddTag}
										onRemoveTag={handleRemoveTag}
										onCreateTag={handleCreateTag}
										articleIds={[data.article.id]}
										triggerClassName="size-9"
									/>,
									<Button
										key="favorite"
										variant="ghost"
										size="icon-sm"
										onClick={() =>
											handleToggleFavorite(
												data.article.id,
												!data.article.isFavorite,
											)
										}
										title={
											data.article.isFavorite
												? "Remove from favorites"
												: "Add to favorites"
										}
										className={
											data.article.isFavorite
												? "text-amber-500 hover:text-amber-600"
												: undefined
										}
									>
										<Star
											className={cn(
												"h-[1.125rem] w-[1.125rem]",
												data.article.isFavorite && "fill-current",
											)}
										/>
									</Button>,
									<Button
										key="read"
										variant="ghost"
										size="icon-sm"
										onClick={() =>
											handleToggleRead(data.article.id, !data.article.isRead)
										}
										title={
											data.article.isRead ? "Mark as unread" : "Mark as read"
										}
									>
										{data.article.isRead ? (
											<BookOpen className="h-[1.125rem] w-[1.125rem]" />
										) : (
											<Check className="h-[1.125rem] w-[1.125rem]" />
										)}
									</Button>,
									<Button
										key="original"
										asChild
										size="sm"
										className="h-9 border border-border bg-white px-3 text-slate-950 shadow-none hover:bg-white/90 hover:text-slate-950 dark:bg-white dark:text-slate-950 dark:hover:bg-white/90"
									>
										<a
											href={data.article.url}
											target="_blank"
											rel="noopener noreferrer"
										>
											<ExternalLink className="h-[1.125rem] w-[1.125rem]" />
											Original
										</a>
									</Button>,
									renderCloseButton("close"),
								]
							: [renderCloseButton("close")]
					}
					mobileRight={[renderCloseButton("mobile-close")]}
					mobileMenuLabel="Reader actions"
				/>

				<div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 2xl:px-8">
					{isLoading ? (
						<div className="space-y-4">
							<Skeleton className="h-8 w-4/5" />
							<Skeleton className="h-4 w-2/3" />
							<Skeleton className="h-28 w-full" />
							<Skeleton className="h-28 w-full" />
						</div>
					) : isError ? (
						<div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
							Hold Shelf could not load this article right now.
						</div>
					) : data ? (
						<article className="mx-auto w-full max-w-none">
							<div className="mb-5 space-y-3">
								{data.article.faviconUrl && (
									<img
										src={data.article.faviconUrl}
										alt=""
										className="h-7 w-7"
										onError={(event) => {
											event.currentTarget.style.display = "none";
										}}
									/>
								)}
								<h1 className="display-title text-2xl font-bold leading-tight">
									{data.article.title ?? data.article.url}
								</h1>
								{data.article.description && (
									<p className="text-sm leading-6 text-muted-foreground">
										{data.article.description}
									</p>
								)}
								<ArticleReaderMetadata payload={data} />
								{data.article.tags.length > 0 && (
									<div className="flex flex-wrap gap-1.5">
										{data.article.tags.map((tag) => (
											<Badge key={tag.id} variant="secondary">
												{tag.name}
											</Badge>
										))}
									</div>
								)}
							</div>

							{data.content.status === "ready" ? (
								<ArticleReaderContent markdown={data.content.markdown} />
							) : (
								<ArticleReaderFallback
									url={data.article.url}
									reason={data.content.reason}
								/>
							)}
						</article>
					) : null}
				</div>
			</div>
		</aside>
	);
}
