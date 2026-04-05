import { createColumnHelper } from "@tanstack/react-table";
import { BookOpen, Check, ExternalLink, Trash2 } from "lucide-react";
import type { ArticleWithTags } from "#/components/articles/types";
import { TagPicker } from "#/components/tags/tag-picker";
import type { Tag } from "#/components/tags/types";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Checkbox } from "#/components/ui/checkbox";
import { formatDate } from "#/lib/formatters";

const columnHelper = createColumnHelper<ArticleWithTags>();

type CreateArchiveColumnsOptions = {
	availableTags: Tag[];
	onAddTag: (tagId: string, articleIds: string[]) => Promise<void>;
	onRemoveTag: (tagId: string, articleIds: string[]) => Promise<void>;
	onCreateTag: (name: string) => Promise<Tag>;
	onToggleRead: (id: string, isRead: boolean) => Promise<void>;
	onDelete: (ids: string[]) => Promise<void>;
};

export function createArchiveColumns({
	availableTags,
	onAddTag,
	onRemoveTag,
	onCreateTag,
	onToggleRead,
	onDelete,
}: CreateArchiveColumnsOptions) {
	return [
		columnHelper.display({
			id: "select",
			header: ({ table }) => (
				<Checkbox
					checked={table.getIsAllRowsSelected()}
					onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => row.toggleSelected(!!value)}
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
							<a
								href={article.url}
								target="_blank"
								rel="noopener noreferrer"
								className="truncate text-sm font-medium no-underline hover:underline"
							>
								{article.title ?? article.url}
							</a>
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
				<div className="flex flex-wrap items-center gap-1">
					{row.original.tags.map((tag) => (
						<Badge
							key={tag.id}
							variant="secondary"
							className="px-1.5 py-0 text-[10px]"
						>
							{tag.name}
						</Badge>
					))}
				</div>
			),
			size: 140,
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
					<div className="flex items-center gap-0.5 opacity-0 group-hover/row:opacity-100">
						<TagPicker
							availableTags={availableTags}
							selectedTagIds={article.tags.map((tag) => tag.id)}
							onAddTag={onAddTag}
							onRemoveTag={onRemoveTag}
							onCreateTag={onCreateTag}
							articleIds={[article.id]}
						/>
						<Button
							variant="ghost"
							size="icon-xs"
							onClick={() => onToggleRead(article.id, !article.isRead)}
							title={article.isRead ? "Mark unread" : "Mark read"}
						>
							{article.isRead ? (
								<BookOpen className="h-3 w-3" />
							) : (
								<Check className="h-3 w-3" />
							)}
						</Button>
						<Button
							variant="ghost"
							size="icon-xs"
							onClick={() => onDelete([article.id])}
							title="Delete"
						>
							<Trash2 className="h-3 w-3" />
						</Button>
					</div>
				);
			},
			size: 90,
		}),
	];
}
