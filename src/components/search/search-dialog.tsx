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
			<DialogContent
				showCloseButton={false}
				className="top-[14vh] translate-y-0 gap-0 overflow-hidden rounded-xl bg-card p-0 shadow-float sm:max-w-xl"
			>
				<DialogTitle className="sr-only">Search</DialogTitle>
				<DialogDescription className="sr-only">
					Search titles, descriptions, sites and saved article text.
				</DialogDescription>
				<SearchPanel onDone={() => onOpenChange(false)} />
			</DialogContent>
		</Dialog>
	);
}
