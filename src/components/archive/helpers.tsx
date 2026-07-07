import { createColumnHelper } from "@tanstack/react-table";
import {
	BookOpen,
	Check,
	EllipsisVertical,
	ExternalLink,
	Star,
	Trash2,
} from "lucide-react";
import { ArticleExternalLink } from "#/components/articles/article-external-link";
import type { ArticleWithTags } from "#/components/articles/types";
import { TagPicker } from "#/components/tags/tag-picker";
import type { Tag } from "#/components/tags/types";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Checkbox } from "#/components/ui/checkbox";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { formatDate } from "#/lib/formatters";

const columnHelper = createColumnHelper<ArticleWithTags>();

function stopArticleOpen(event: { stopPropagation: () => void }) {
	event.stopPropagation();
}

type CreateArchiveColumnsOptions = {
	availableTags: Tag[];
	onAddTag: (tagId: string, articleIds: string[]) => Promise<void>;
	onRemoveTag: (tagId: string, articleIds: string[]) => Promise<void>;
	onCreateTag: (name: string) => Promise<Tag>;
	onOpenArticle: (id: string, isRead: boolean) => Promise<void>;
	onToggleRead: (id: string, isRead: boolean) => Promise<void>;
	onToggleFavorite: (id: string, isFavorite: boolean) => Promise<void>;
	onDelete: (ids: string[]) => Promise<void>;
};

export function createArchiveColumns({
	availableTags,
	onAddTag,
	onRemoveTag,
	onCreateTag,
	onOpenArticle,
	onToggleRead,
	onToggleFavorite,
	onDelete,
}: CreateArchiveColumnsOptions) {
	return [
		columnHelper.display({
			id: "select",
			header: ({ table }) => (
				<Checkbox
					checked={table.getIsAllRowsSelected()}
					onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
					onClick={(event) => event.stopPropagation()}
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => row.toggleSelected(!!value)}
					onClick={(event) => event.stopPropagation()}
				/>
			),
			size: 32,
		}),
		columnHelper.display({
			id: "status",
			header: () => null,
			cell: ({ row }) => (
				<div className="flex items-center justify-center">
					<span
						className={`h-2 w-2 rounded-full ${row.original.isRead ? "bg-muted-foreground/30" : "bg-primary"}`}
						title={row.original.isRead ? "Read" : "Unread"}
					/>
				</div>
			),
			size: 24,
		}),
		columnHelper.accessor("title", {
			header: "Title",
			size: 520,
			cell: ({ row }) => {
				const article = row.original;
				return (
					<div className="min-w-0">
						<div className="flex items-center gap-1.5">
							{article.faviconUrl && (
								<img
									src={article.faviconUrl}
									alt=""
									className="h-4 w-4 shrink-0"
									onError={(event) => {
										event.currentTarget.style.display = "none";
									}}
								/>
							)}
							<ArticleExternalLink
								articleId={article.id}
								href={article.url}
								isRead={article.isRead}
								onOpenArticle={onOpenArticle}
								className="truncate text-sm font-medium no-underline hover:underline"
							>
								{article.title ?? article.url}
							</ArticleExternalLink>
							{article.isFavorite && (
								<Star className="h-3.5 w-3.5 shrink-0 fill-current text-amber-500" />
							)}
							<ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 group-hover/row:opacity-100" />
						</div>
						{article.hostname && (
							<p className="mt-0.5 truncate text-xs text-muted-foreground">
								{article.hostname}
							</p>
						)}
					</div>
				);
			},
		}),
		columnHelper.accessor("tags", {
			header: "Tags",
			cell: ({ row }) => (
				<div className="flex min-w-0 items-center gap-1 overflow-hidden">
					{row.original.tags.map((tag) => (
						<Badge
							key={tag.id}
							variant="secondary"
							className="max-w-24 shrink-0 truncate px-1.5 py-0 text-[10px]"
						>
							{tag.name}
						</Badge>
					))}
				</div>
			),
			size: 240,
		}),
		columnHelper.accessor("createdAt", {
			header: "Saved",
			cell: (info) => (
				<span className="whitespace-nowrap text-xs text-muted-foreground">
					{formatDate(info.getValue())}
				</span>
			),
			size: 62,
		}),
		columnHelper.display({
			id: "actions",
			header: () => null,
			cell: ({ row }) => {
				const article = row.original;
				return (
					<div className="flex min-w-[3.75rem] items-center justify-end gap-px whitespace-nowrap opacity-0 group-hover/row:opacity-100">
						<TagPicker
							availableTags={availableTags}
							selectedTagIds={article.tags.map((tag) => tag.id)}
							onAddTag={onAddTag}
							onRemoveTag={onRemoveTag}
							onCreateTag={onCreateTag}
							articleIds={[article.id]}
						/>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									size="icon-xs"
									aria-label={`Article actions for ${article.title ?? article.url}`}
									title="More actions"
									onClick={stopArticleOpen}
									onKeyDown={stopArticleOpen}
								>
									<EllipsisVertical className="h-3.5 w-3.5" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem
									onClick={(event) => {
										stopArticleOpen(event);
										void onToggleFavorite(article.id, !article.isFavorite);
									}}
								>
									<Star
										className={
											article.isFavorite
												? "h-4 w-4 fill-current text-amber-500"
												: "h-4 w-4"
										}
									/>
									{article.isFavorite
										? "Remove from favorites"
										: "Add to favorites"}
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={(event) => {
										stopArticleOpen(event);
										void onToggleRead(article.id, !article.isRead);
									}}
								>
									{article.isRead ? (
										<BookOpen className="h-4 w-4" />
									) : (
										<Check className="h-4 w-4" />
									)}
									{article.isRead ? "Mark unread" : "Mark read"}
								</DropdownMenuItem>
								<DropdownMenuItem
									variant="destructive"
									onClick={(event) => {
										stopArticleOpen(event);
										void onDelete([article.id]);
									}}
								>
									<Trash2 className="h-4 w-4" />
									Delete
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				);
			},
			size: 72,
		}),
	];
}
