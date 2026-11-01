import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { Button } from "#/components/ui/button";
import { cn } from "#/lib/utils";

type BulkActionButtonProps = {
	icon: PhosphorIcon;
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
				"h-8 min-w-8 text-inverse-foreground hover:bg-inverse-foreground/10 hover:text-inverse-foreground pointer-coarse:h-10 pointer-coarse:min-w-10 dark:hover:bg-inverse-foreground/10",
				!showLabel && "px-0",
			)}
		>
			<Icon />
			{showLabel && <span className="hidden sm:inline">{label}</span>}
		</Button>
	);
}
