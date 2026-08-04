import { Link } from "@tanstack/react-router";
import { Tag, Trash2 } from "lucide-react";
import { RenameTagDialog } from "#/components/tags/rename-tag-dialog";
import { Button } from "#/components/ui/button";
import { cn } from "#/lib/utils";

type SidebarTagItemProps = {
	tag: { id: string; name: string; articleCount: number };
	isActive: boolean;
	onRename: (name: string) => Promise<void>;
	onDelete: () => Promise<void>;
};

export function SidebarTagItem({
	tag,
	isActive,
	onRename,
	onDelete,
}: SidebarTagItemProps) {
	return (
		<div
			className={cn(
				"group/tag flex items-center rounded-lg text-sm transition-colors",
				isActive
					? "bg-sidebar-accent text-sidebar-accent-foreground"
					: "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
			)}
		>
			<Link
				to="/app/tags"
				search={{ tag: tag.id }}
				className="flex min-w-0 flex-1 items-center gap-2.5 px-2.5 py-1.5 no-underline"
			>
				<Tag className="h-3.5 w-3.5 shrink-0" />
				<span className="flex-1 truncate">{tag.name}</span>
			</Link>
			<div className="w-0 shrink-0 overflow-hidden opacity-0 transition-[width,opacity] group-hover/tag:w-[3.875rem] group-hover/tag:opacity-100 group-has-[:focus-visible]/tag:w-[3.875rem] group-has-[:focus-visible]/tag:opacity-100">
				<div className="ml-1 flex items-center gap-0.5">
					<RenameTagDialog
						tagName={tag.name}
						onRename={onRename}
						triggerSize="icon-xs"
						triggerClassName="text-sidebar-foreground/70 hover:bg-sidebar-accent"
						triggerAriaLabel={`Rename ${tag.name}`}
					/>
					<Button
						type="button"
						variant="ghost"
						size="icon-xs"
						onClick={() => void onDelete()}
						aria-label={`Delete ${tag.name}`}
						title="Delete tag"
						className="text-sidebar-foreground/70 hover:bg-sidebar-accent"
					>
						<Trash2 className="h-3.5 w-3.5" />
					</Button>
				</div>
			</div>
			<span className="mr-2 min-w-4 shrink-0 text-right text-xs text-sidebar-foreground/60">
				{tag.articleCount}
			</span>
		</div>
	);
}
