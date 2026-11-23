import { CaretRight } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { type ReactNode, useId } from "react";

import { cn } from "#/lib/utils";

type ShelfProps = {
	title: string;
	className?: string;
	href?: string;
	linkLabel?: string;
	isEmpty?: boolean;
	emptyMessage?: string;
	children: ReactNode;
};

export function Shelf({
	title,
	className,
	href,
	linkLabel,
	isEmpty,
	emptyMessage,
	children,
}: ShelfProps) {
	const headingId = useId();

	return (
		<section aria-labelledby={headingId} className={cn("min-w-0", className)}>
			{/* The 2px ink line is the shelf from the logo. */}
			<div className="flex items-center justify-between gap-3 md:items-baseline md:border-b-2 md:border-foreground md:pb-2.5">
				<h2
					id={headingId}
					className="font-serif text-[22px] leading-7 font-semibold md:text-[17px] md:leading-normal"
				>
					{title}
				</h2>
				{href && linkLabel && (
					<Link
						to={href}
						className="inline-flex min-h-10 shrink-0 items-center gap-1 text-sm font-semibold whitespace-nowrap text-primary no-underline tabular-nums hover:underline md:min-h-0 md:text-xs"
					>
						{linkLabel}
						<CaretRight aria-hidden="true" className="size-3.5 md:hidden" />
					</Link>
				)}
			</div>
			{isEmpty ? (
				<p className="py-3.5 text-sm text-muted-foreground">{emptyMessage}</p>
			) : (
				<ul>{children}</ul>
			)}
		</section>
	);
}
