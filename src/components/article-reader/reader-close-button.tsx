import { X } from "lucide-react";
import { Button } from "#/components/ui/button";
export function ReaderCloseButton({ onClick }: { onClick: () => void }) {
	return (
		<Button
			variant="ghost"
			size="icon-sm"
			onClick={onClick}
			aria-label="Close reader"
			title="Close reader"
		>
			<X className="size-5" />
		</Button>
	);
}
