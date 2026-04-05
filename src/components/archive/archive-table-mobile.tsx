import {
	BookOpen,
	Check,
	EllipsisVertical,
	ExternalLink,
	Trash2,
} from "lucide-react";
import type { ArticleWithTags } from "#/components/articles/types";
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

type ArchiveTableMobileProps = {
	articles: ArticleWithTags[];
	rowSelection: Record<string, boolean>;
	onRowSelectionChange: React.Dispatch<
		React.SetStateAction<Record<string, boolean>>
	>;
	availableTags: Tag[];
	onAddTag: (tagId: string, articleIds: string[]) => Promise<void>;
	onRemoveTag: (tagId: string, articleIds: string[]) => Promise<void>;
	onCreateTag: (name: string) => Promise<Tag>;
	onToggleRead: (id: string, isRead: boolean) => Promise<void>;
	onDelete: (ids: string[]) => Promise<void>;
};

export function ArchiveTableMobile({
	articles,
	rowSelection,
	onRowSelectionChange,
	onToggleRead,
	onDelete,
}: ArchiveTableMobileProps) {
	const hasSelection = Object.values(rowSelection).some(Boolean);

	function toggleRow(articleId: string, isSelected: boolean) {
		onRowSelectionChange((current) => {
			const next = { ...current };
			if (isSelected) {
				next[articleId] = true;
			} else {
				delete next[articleId];
			}
			return next;
		});
	}

	return (
		<div className="md:hidden">
			<div className="divide-y">
				{articles.map((article) => {
					const isSelected = Boolean(rowSelection[article.id]);

					return (
						<div
							key={article.id}
							className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-2 py-2"
						>
							<div className="min-w-0 space-y-2">
								<div className="flex min-w-0 items-start gap-1.5">
									{hasSelection || isSelected ? (
										<Checkbox
											checked={isSelected}
											onCheckedChange={(value) =>
												toggleRow(article.id, !!value)
											}
											className="mt-0.5"
										/>
									) : null}
									<a
										href={article.url}
										target="_blank"
										rel="noopener noreferrer"
										className="min-w-0 flex-1 text-sm font-medium leading-snug no-underline hover:underline"
									>
										<span className="line-clamp-1 break-words">
											{article.title ?? article.url}
										</span>
									</a>
									<ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
								</div>

								<div className="min-w-0 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
									<span className="truncate">
										{article.hostname ?? article.url}
									</span>
									{article.tags.map((tag) => (
										<Badge
											key={tag.id}
											variant="secondary"
											className="px-1.5 py-0 text-[10px]"
										>
											{tag.name}
										</Badge>
									))}
								</div>
							</div>

							<div className="flex items-start justify-end pt-0.5">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											size="icon-xs"
											aria-label={`Article actions for ${article.title ?? article.url}`}
										>
											<EllipsisVertical className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem
											onClick={() => toggleRow(article.id, !isSelected)}
										>
											{isSelected ? "Deselect article" : "Select article"}
										</DropdownMenuItem>
										<DropdownMenuItem
											onClick={() => onToggleRead(article.id, !article.isRead)}
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
											onClick={() => onDelete([article.id])}
										>
											<Trash2 className="h-4 w-4" />
											Delete
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
