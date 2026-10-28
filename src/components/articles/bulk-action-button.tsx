import type { LucideIcon } from "lucide-react";
import { Button } from "#/components/ui/button";
import { cn } from "#/lib/utils";

type BulkActionButtonProps = {
	icon: LucideIcon;
	label: string;
	onClick: () => void;
	/** Show the label next to the icon on wider screens. */
	showLabel?: boolean;
};

export function BulkActionButton({
	icon: Icon,
	label,
	onClick,
	showLabel = true,
}: BulkActionButtonProps) {
	return (
		<Button
			type="button"
			variant="ghost"
			size="sm"
			title={label}
			aria-label={label}
			onClick={onClick}
			className={cn(
				"h-8 text-inverse-foreground hover:bg-inverse-foreground/10 hover:text-inverse-foreground dark:hover:bg-inverse-foreground/10",
				!showLabel && "w-8 px-0",
			)}
		>
			<Icon />
			{showLabel && <span className="hidden sm:inline">{label}</span>}
		</Button>
	);
}
