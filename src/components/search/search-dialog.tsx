import { SearchPanel } from "#/components/search/search-panel";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";

type SearchDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			{/* Phones pin the panel to the top so it stays above the keyboard. */}
			<DialogContent
				showCloseButton={false}
				className="top-2 max-w-[calc(100%-1rem)] translate-y-0 gap-0 overflow-hidden rounded-xl bg-card p-0 shadow-float sm:top-[14vh] sm:max-w-xl"
			>
				<DialogTitle className="sr-only">Search</DialogTitle>
				<DialogDescription className="sr-only">
					Search titles, descriptions, sites and saved article text.
				</DialogDescription>
				<SearchPanel
					onDone={() => onOpenChange(false)}
					onClose={() => onOpenChange(false)}
				/>
			</DialogContent>
		</Dialog>
	);
}
