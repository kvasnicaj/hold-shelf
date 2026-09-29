import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Check, ExternalLink, RefreshCw, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ReaderBody } from "#/components/article-reader/reader-body";
import { ReaderCloseButton } from "#/components/article-reader/reader-close-button";
import { ReaderFrame } from "#/components/article-reader/reader-frame";
import { ReaderPreferences } from "#/components/article-reader/reader-preferences";
import { useArticleReader } from "#/components/article-reader/use-article-reader";
import { tagListOptions } from "#/components/articles/query-options";
import { useArticleMutations } from "#/components/articles/use-article-mutations";
import { ColumnNavbar } from "#/components/layout/column-navbar";
import { TagPicker } from "#/components/tags/tag-picker";
import { Button } from "#/components/ui/button";
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
	const [fontSize, setFontSize] = useState(18);
	useEffect(() => {
		try {
			const value = JSON.parse(
				localStorage.getItem("reader-preferences") ?? "null",
			);
			if (value) {
				setFontSize(Math.max(14, Math.min(24, Number(value.fontSize) || 18)));
			}
		} catch {}
	}, []);
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
					right={[
						...(data
							? [
									<TagPicker
										key="tags"
										availableTags={tagList}
										selectedTagIds={data.article.tags.map((tag) => tag.id)}
										onAddTag={actions.handleAddTag}
										onRemoveTag={actions.handleRemoveTag}
										onCreateTag={actions.handleCreateTag}
										articleIds={[data.article.id]}
									/>,
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
										onClick={() =>
											void actions.handleToggleFavorite(
												data.article.id,
												!data.article.isFavorite,
											)
										}
									>
										<Star
											className={
												data.article.isFavorite
													? "size-5 fill-current text-amber-600"
													: "size-5"
											}
										/>
									</Button>,
									<Button
										key="read"
										variant="ghost"
										size="icon-sm"
										disabled={actions.isPending}
										aria-label={
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
											<BookOpen className="size-5" />
										) : (
											<Check className="size-5" />
										)}
									</Button>,
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
											className={
												refresh.isPending ? "size-5 animate-spin" : "size-5"
											}
										/>
									</Button>,
									<Button key="original" variant="outline" size="sm" asChild>
										<a
											href={data.article.url}
											target="_blank"
											rel="noopener noreferrer"
										>
											<ExternalLink className="size-4" />
											Original
										</a>
									</Button>,
								]
							: []),
						<ReaderCloseButton key="close" onClick={closeArticle} />,
					]}
					mobileRight={[
						<ReaderCloseButton key="mobile-close" onClick={closeArticle} />,
					]}
					mobileMenuLabel="Reader actions"
				/>
				<ReaderPreferences
					fontSize={fontSize}
					onChange={(size) => {
						setFontSize(size);
						try {
							localStorage.setItem(
								"reader-preferences",
								JSON.stringify({ fontSize: size }),
							);
						} catch {}
					}}
				/>
				{isError ? (
					<div role="alert" className="p-6">
						Could not load this article.{" "}
						<Button variant="outline" onClick={() => void refetch()}>
							Try again
						</Button>
					</div>
				) : isPending ? (
					<p role="status" className="p-6">
						Loading saved article…
					</p>
				) : data ? (
					<ReaderBody key={data.article.id} data={data} fontSize={fontSize} />
				) : null}
			</div>
		</ReaderFrame>
	);
}
