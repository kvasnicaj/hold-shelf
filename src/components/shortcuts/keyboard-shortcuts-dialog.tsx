import {
	ACTION_SHORTCUTS,
	NAVIGATION_SHORTCUTS,
} from "#/components/shortcuts/helpers";
import { ShortcutGroup } from "#/components/shortcuts/shortcut-group";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";

type KeyboardShortcutsDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function KeyboardShortcutsDialog({
	open,
	onOpenChange,
}: KeyboardShortcutsDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="bg-card sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="font-serif text-xl font-semibold">
						Keyboard shortcuts
					</DialogTitle>
					<DialogDescription>
						Shortcuts work anywhere in the app outside text fields.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-5">
					<ShortcutGroup title="Actions" shortcuts={ACTION_SHORTCUTS} />
					<ShortcutGroup title="Navigation" shortcuts={NAVIGATION_SHORTCUTS} />
				</div>
			</DialogContent>
		</Dialog>
	);
}
