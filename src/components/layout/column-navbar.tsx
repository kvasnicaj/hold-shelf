import { MoreHorizontal } from "lucide-react";
import { Children, type ReactNode } from "react";
import { Button } from "#/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "#/components/ui/popover";
import { cn } from "#/lib/utils";

type ColumnNavbarProps = {
	"aria-label": string;
	left?: ReactNode[];
	center?: ReactNode[];
	right?: ReactNode[];
	mobileRight?: ReactNode[];
	mobileMenuLabel?: string;
	className?: string;
};

export function ColumnNavbar({
	"aria-label": ariaLabel,
	left = [],
	center = [],
	right = [],
	mobileRight = [],
	mobileMenuLabel = "Column actions",
	className,
}: ColumnNavbarProps) {
	const leftItems = Children.toArray(left);
	const centerItems = Children.toArray(center);
	const rightItems = Children.toArray(right);
	const mobileRightItems = Children.toArray(mobileRight);
	const mobileLeadingItems = leftItems.slice(0, 1);
	const mobileMenuItems = [...leftItems.slice(1), ...rightItems];

	return (
		<nav
			aria-label={ariaLabel}
			className={cn(
				"grid h-13 shrink-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b bg-background px-3 md:grid-cols-[minmax(max-content,1fr)_minmax(12rem,42rem)_minmax(max-content,1fr)] md:gap-3",
				className,
			)}
		>
			<div className="flex min-w-0 items-center justify-start">
				{mobileLeadingItems.length > 0 ? (
					<div className="flex min-w-0 items-center gap-1.5 md:hidden">
						{mobileLeadingItems}
					</div>
				) : null}
				{leftItems.length > 0 ? (
					<div className="hidden min-w-0 items-center gap-1.5 md:flex">
						{leftItems}
					</div>
				) : null}
			</div>

			<div className="flex min-w-0 items-center justify-center gap-1.5">
				{centerItems}
			</div>

			<div className="flex min-w-0 items-center justify-end">
				{rightItems.length > 0 ? (
					<div className="hidden min-w-0 items-center justify-end gap-1.5 md:flex">
						{rightItems}
					</div>
				) : null}
				{mobileRightItems.length > 0 ? (
					<div className="flex min-w-0 items-center justify-end gap-1.5 md:hidden">
						{mobileRightItems}
					</div>
				) : null}
				{mobileMenuItems.length > 0 ? (
					<Popover>
						<PopoverTrigger asChild>
							<Button
								variant="ghost"
								size="icon-sm"
								className="md:hidden"
								title={mobileMenuLabel}
							>
								<MoreHorizontal className="h-[1.125rem] w-[1.125rem]" />
								<span className="sr-only">{mobileMenuLabel}</span>
							</Button>
						</PopoverTrigger>
						<PopoverContent align="end" className="w-auto min-w-0 p-1.5">
							<div className="flex items-center gap-1.5">{mobileMenuItems}</div>
						</PopoverContent>
					</Popover>
				) : null}
			</div>
		</nav>
	);
}
