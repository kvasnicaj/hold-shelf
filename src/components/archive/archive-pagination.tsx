import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "#/components/ui/button";

type ArchivePaginationProps = {
	page: number;
	totalPages: number;
	onPrevious: () => void;
	onNext: () => void;
};

export function ArchivePagination({
	page,
	totalPages,
	onPrevious,
	onNext,
}: ArchivePaginationProps) {
	if (totalPages <= 1) {
		return null;
	}

	return (
		<div className="flex items-center justify-between">
			<p className="text-sm text-muted-foreground">
				Page {page} of {totalPages}
			</p>
			<div className="flex items-center gap-1">
				<Button
					variant="outline"
					size="sm"
					disabled={page <= 1}
					onClick={onPrevious}
				>
					<ChevronLeft className="mr-1 h-4 w-4" />
					Previous
				</Button>
				<Button
					variant="outline"
					size="sm"
					disabled={page >= totalPages}
					onClick={onNext}
				>
					Next
					<ChevronRight className="ml-1 h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
