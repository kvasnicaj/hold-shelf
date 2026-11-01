import { Badge } from "#/components/ui/badge";
import { cn } from "#/lib/utils";

type TagLabelProps = {
	name: string;
	className?: string;
};

/** A tag shown on an article row: a square label at the metadata size. */
export function TagLabel({ name, className }: TagLabelProps) {
	return (
		<Badge
			variant="secondary"
			className={cn("px-1.5 py-0 text-xs leading-[1.125rem]", className)}
		>
			{name}
		</Badge>
	);
}
