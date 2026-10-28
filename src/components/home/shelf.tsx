import { Link } from "@tanstack/react-router";
import { type ReactNode, useId } from "react";

type ShelfProps = {
	title: string;
	href: string;
	linkLabel: string;
	isEmpty: boolean;
	emptyMessage: string;
	children: ReactNode;
};

export function Shelf({
	title,
	href,
	linkLabel,
	isEmpty,
	emptyMessage,
	children,
}: ShelfProps) {
	const headingId = useId();

	return (
		<section aria-labelledby={headingId} className="min-w-0">
			{/* The 2px ink line is the shelf from the logo. */}
			<div className="flex items-baseline justify-between gap-3 border-b-2 border-foreground pb-2.5">
				<h2 id={headingId} className="font-serif text-[17px] font-semibold">
					{title}
				</h2>
				<Link
					to={href}
					className="text-xs font-semibold text-primary no-underline hover:underline"
				>
					{linkLabel}
				</Link>
			</div>
			{isEmpty ? (
				<p className="py-3.5 text-sm text-muted-foreground">{emptyMessage}</p>
			) : (
				<ul>{children}</ul>
			)}
		</section>
	);
}
