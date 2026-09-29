import { useRef } from "react";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";

type TrashDeleteDialogProps = {
	open: boolean;
	all: boolean;
	articleTitle?: string;
	pending: boolean;
	error: string | null;
	onClose: () => void;
	onConfirm: () => void;
};
export function TrashDeleteDialog({
	open,
	all,
	articleTitle,
	pending,
	error,
	onClose,
	onConfirm,
}: TrashDeleteDialogProps) {
	const cancel = useRef<HTMLButtonElement>(null);
	const returnFocus = useRef<HTMLElement | null>(null);
	return (
		<Dialog
			open={open}
			onOpenChange={(next) => {
				if (!next && !pending) onClose();
			}}
		>
			<DialogContent
				onOpenAutoFocus={(event) => {
					event.preventDefault();
					returnFocus.current = document.activeElement as HTMLElement;
					cancel.current?.focus();
				}}
				onCloseAutoFocus={(event) => {
					event.preventDefault();
					returnFocus.current?.focus();
				}}
			>
				<DialogHeader>
					<DialogTitle>
						{all ? "Empty Trash?" : "Permanently delete this article?"}
					</DialogTitle>
					<DialogDescription>
						{all
							? "All articles currently in Trash will be permanently deleted, including their saved content, tag assignments, and reading progress."
							: `${articleTitle ? `“${articleTitle}”` : "This article"} and its saved content, tag assignments, and reading progress will be permanently deleted.`}{" "}
						This cannot be undone.
					</DialogDescription>
				</DialogHeader>
				{error && (
					<p role="alert" className="text-sm text-destructive-foreground">
						{error}
					</p>
				)}
				<DialogFooter>
					<Button
						ref={cancel}
						variant="outline"
						disabled={pending}
						onClick={onClose}
					>
						Cancel
					</Button>
					<Button variant="destructive" disabled={pending} onClick={onConfirm}>
						{pending ? "Deleting…" : all ? "Empty Trash" : "Permanently delete"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
