import { Children, type ReactNode } from "react";
import { cn } from "#/lib/utils";

type ColumnNavbarProps = {
	"aria-label": string;
	left?: ReactNode[];
	center?: ReactNode[];
	right?: ReactNode[];
	className?: string;
};

/**
 * A column's top bar with three slots. Every item stays visible; an item that
 * only fits on wider screens hides itself and repeats in its owner's labeled
 * `ActionsMenu`.
 */
export function ColumnNavbar({
	"aria-label": ariaLabel,
	left = [],
	center = [],
	right = [],
	className,
}: ColumnNavbarProps) {
	const leftItems = Children.toArray(left);
	const centerItems = Children.toArray(center);
	const rightItems = Children.toArray(right);

	return (
		<nav
			aria-label={ariaLabel}
			className={cn(
				"grid h-13 shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b px-2 md:grid-cols-[minmax(max-content,1fr)_minmax(12rem,42rem)_minmax(max-content,1fr)] md:gap-3 md:px-3",
				className,
			)}
		>
			<div className="flex min-w-0 items-center justify-start gap-1.5">
				{leftItems}
			</div>

			<div className="flex min-w-0 items-center justify-center gap-1.5">
				{centerItems}
			</div>

			<div className="flex min-w-0 items-center justify-end gap-1 md:gap-1.5">
				{rightItems}
			</div>
		</nav>
	);
}
