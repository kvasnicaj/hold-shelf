import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	Bookmark,
	BookOpen,
	Check,
	ExternalLink,
	RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { ReaderBody } from "#/components/article-reader/reader-body";
import { ReaderCloseButton } from "#/components/article-reader/reader-close-button";
import { ReaderFrame } from "#/components/article-reader/reader-frame";
import { ReaderPreferences } from "#/components/article-reader/reader-preferences";
import { useArticleReader } from "#/components/article-reader/use-article-reader";
import { useReaderSettings } from "#/components/article-reader/use-reader-settings";
import { tagListOptions } from "#/components/articles/query-options";
import { useArticleMutations } from "#/components/articles/use-article-mutations";
import { ColumnNavbar } from "#/components/layout/column-navbar";
import { TagPicker } from "#/components/tags/tag-picker";
import { Button } from "#/components/ui/button";
import { cn } from "#/lib/utils";
import { getArticleReader } from "#/server/articles";
import { refreshArticleContent } from "#/server/library";

export function ArticleReaderPanel() {
	const { articleId, isOpen, closeArticle } = useArticleReader();
	const client = useQueryClient();
	const { data: tagList = [] } = useQuery(tagListOptions());
	const { data, isPending, isError, refetch } = useQuery({
		queryKey: ["article-reader", articleId],
		queryFn: () => getArticleReader({ data: { id: articleId ?? "" } }),
		enabled: Boolean(articleId),
	});
	const actions = useArticleMutations();
	const { settings, updateSettings } = useReaderSettings();
	const refresh = useMutation({
		mutationFn: () => refreshArticleContent({ data: { id: articleId ?? "" } }),
		onSuccess: (result) => {
			client.setQueryData(["article-reader", result.article.id], result);
			toast.success(
				result.content.refreshError
					? `Kept your saved copy: ${result.content.refreshError}`
					: result.content.status === "ready"
						? "Saved content refreshed"
						: "The original site could not be read. Try opening the original.",
			);
		},
		onError: () =>
			toast.error("Could not refresh this article. Please try again."),
	});
	return (
		<ReaderFrame open={isOpen} onClose={closeArticle}>
			<div className="flex h-full min-h-0 flex-col">
				<ColumnNavbar
					aria-label="Article reader navigation"
					left={[<ReaderCloseButton key="close" onClick={closeArticle} />]}
					right={
						data
							? [
									<Button
										key="read"
										variant="ghost"
										size="icon-sm"
										disabled={actions.isPending}
										aria-label={
											data.article.isRead ? "Mark as unread" : "Mark as read"
										}
										title={
											data.article.isRead ? "Mark as unread" : "Mark as read"
										}
										onClick={() =>
											void actions.handleToggleRead(
												data.article.id,
												!data.article.isRead,
											)
										}
									>
										{data.article.isRead ? (
											<BookOpen className="size-[1.125rem]" />
										) : (
											<Check className="size-[1.125rem]" />
										)}
									</Button>,
									<Button
										key="favorite"
										variant="ghost"
										size="icon-sm"
										disabled={actions.isPending}
										aria-label={
											data.article.isFavorite
												? "Remove from favorites"
												: "Add to favorites"
										}
										title={
											data.article.isFavorite
												? "Remove from favorites"
												: "Add to favorites"
										}
										onClick={() =>
											void actions.handleToggleFavorite(
												data.article.id,
												!data.article.isFavorite,
											)
										}
									>
										<Bookmark
											className={cn(
												"size-[1.125rem]",
												data.article.isFavorite && "fill-current text-favorite",
											)}
										/>
									</Button>,
									<TagPicker
										key="tags"
										availableTags={tagList}
										selectedTagIds={data.article.tags.map((tag) => tag.id)}
										onAddTag={actions.handleAddTag}
										onRemoveTag={actions.handleRemoveTag}
										onCreateTag={actions.handleCreateTag}
										articleIds={[data.article.id]}
									/>,
									<ReaderPreferences
										key="settings"
										settings={settings}
										onChange={updateSettings}
									/>,
									<Button
										key="refresh"
										variant="ghost"
										size="icon-sm"
										aria-label="Refresh saved content"
										title="Refresh saved content"
										disabled={refresh.isPending}
										onClick={() => refresh.mutate()}
									>
										<RefreshCw
											className={cn(
												"size-[1.125rem]",
												refresh.isPending && "animate-spin",
											)}
										/>
									</Button>,
									<Button key="original" variant="ghost" size="icon-sm" asChild>
										<a
											href={data.article.url}
											target="_blank"
											rel="noopener noreferrer"
											aria-label="Open original"
											title="Open original"
										>
											<ExternalLink className="size-[1.125rem]" />
										</a>
									</Button>,
								]
							: []
					}
					mobileMenuLabel="Reader actions"
				/>
				{isError ? (
					<div role="alert" className="space-y-3 p-6 text-sm">
						<p>This article could not be loaded.</p>
						<Button variant="outline" onClick={() => void refetch()}>
							Try again
						</Button>
					</div>
				) : isPending ? (
					<p role="status" className="p-6 text-sm text-muted-foreground">
						Loading saved article…
					</p>
				) : data ? (
					<ReaderBody key={data.article.id} data={data} settings={settings} />
				) : null}
			</div>
		</ReaderFrame>
	);
}
