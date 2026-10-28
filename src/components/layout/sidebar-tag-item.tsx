import { Link } from "@tanstack/react-router";
import { Hash, Trash2 } from "lucide-react";
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
				"group/tag flex h-8 items-center rounded-md text-sm transition-colors",
				isActive
					? "bg-sidebar-accent font-semibold text-sidebar-accent-foreground ring-1 ring-sidebar-border"
					: "text-muted-foreground hover:bg-accent hover:text-foreground",
			)}
		>
			<Link
				to="/app/tags"
				search={{ tag: tag.id }}
				aria-current={isActive ? "page" : undefined}
				className="flex h-full min-w-0 flex-1 items-center gap-2.5 px-2.5 no-underline"
			>
				<Hash
					className={cn(
						"size-3.5 shrink-0",
						isActive ? "text-mark" : "text-faint-foreground",
					)}
				/>
				<span className="flex-1 truncate">{tag.name}</span>
			</Link>
			<div className="w-0 shrink-0 overflow-hidden opacity-0 transition-[width,opacity] group-hover/tag:w-[3.875rem] group-hover/tag:opacity-100 group-has-[:focus-visible]/tag:w-[3.875rem] group-has-[:focus-visible]/tag:opacity-100">
				<div className="ml-1 flex items-center gap-0.5">
					<RenameTagDialog
						tagName={tag.name}
						onRename={onRename}
						triggerSize="icon-xs"
						triggerClassName="text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
						triggerAriaLabel={`Rename ${tag.name}`}
					/>
					<Button
						type="button"
						variant="ghost"
						size="icon-xs"
						onClick={() => void onDelete()}
						aria-label={`Delete ${tag.name}`}
						title="Delete tag"
						className="text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
					>
						<Trash2 className="h-3.5 w-3.5" />
					</Button>
				</div>
			</div>
			<span className="mr-2.5 min-w-4 shrink-0 text-right text-xs font-normal tabular-nums text-muted-foreground">
				{tag.articleCount}
			</span>
		</div>
	);
}
