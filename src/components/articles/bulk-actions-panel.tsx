import { BookOpen, Check, ListChecks, Trash2, X } from "lucide-react";
import { ToolBox } from "#/components/layout/tool-box";
import { Button } from "#/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";

type BulkActionsPanelProps = {
	count: number;
	onMarkRead: () => void;
	onMarkUnread: () => void;
	onDelete: () => void;
	onClear: () => void;
};

export function BulkActionsPanel({
	count,
	onMarkRead,
	onMarkUnread,
	onDelete,
	onClear,
}: BulkActionsPanelProps) {
	return (
		<div className="flex min-w-0 justify-start sm:justify-center">
			<ToolBox className="hidden sm:inline-flex">
				<span className="px-2.5 text-sm text-muted-foreground whitespace-nowrap">
					{count} selected
				</span>
				<Button
					variant="ghost"
					size="icon-sm"
					onClick={onMarkRead}
					title="Mark read"
				>
					<Check className="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon-sm"
					onClick={onMarkUnread}
					title="Mark unread"
				>
					<BookOpen className="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon-sm"
					onClick={onDelete}
					title="Delete"
				>
					<Trash2 className="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon-sm"
					onClick={onClear}
					title="Clear selection"
				>
					<X className="h-4 w-4" />
				</Button>
			</ToolBox>
			<div className="sm:hidden">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<ToolBox asChild>
							<button
								type="button"
								className="flex size-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
								aria-label="Bulk actions"
							>
								<ListChecks className="h-4 w-4" />
							</button>
						</ToolBox>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="center">
						<div className="px-2 py-1.5 text-sm text-muted-foreground">
							{count} selected
						</div>
						<DropdownMenuItem onClick={onMarkRead}>
							<Check className="mr-2 h-4 w-4" />
							Mark read
						</DropdownMenuItem>
						<DropdownMenuItem onClick={onMarkUnread}>
							<BookOpen className="mr-2 h-4 w-4" />
							Mark unread
						</DropdownMenuItem>
						<DropdownMenuItem onClick={onDelete}>
							<Trash2 className="mr-2 h-4 w-4" />
							Delete
						</DropdownMenuItem>
						<DropdownMenuItem onClick={onClear}>
							<X className="mr-2 h-4 w-4" />
							Clear selection
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
