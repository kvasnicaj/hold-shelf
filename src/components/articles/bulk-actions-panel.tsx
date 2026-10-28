import { BookOpen, Check, Trash2, X } from "lucide-react";
import { BulkActionButton } from "#/components/articles/bulk-action-button";

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
		<div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+4.75rem)] z-40 flex justify-center px-3 md:bottom-6 md:left-56">
			<div
				role="toolbar"
				aria-label="Bulk actions"
				className="pointer-events-auto flex max-w-full items-center gap-0.5 rounded-lg bg-inverse py-1 pr-1 pl-3.5 text-sm text-inverse-foreground shadow-float"
			>
				<span className="mr-2 font-semibold whitespace-nowrap tabular-nums">
					{count} selected
				</span>
				<BulkActionButton icon={Check} label="Mark read" onClick={onMarkRead} />
				<BulkActionButton
					icon={BookOpen}
					label="Mark unread"
					onClick={onMarkUnread}
				/>
				<BulkActionButton icon={Trash2} label="Delete" onClick={onDelete} />
				<BulkActionButton
					icon={X}
					label="Clear selection"
					onClick={onClear}
					showLabel={false}
				/>
			</div>
		</div>
	);
}
