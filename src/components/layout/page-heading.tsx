import type { ReactNode } from "react";
import { cn } from "#/lib/utils";

type PageHeadingProps = {
	title: ReactNode;
	/** Quiet tabular count beside the title, e.g. "12 articles". */
	count?: string;
	description?: ReactNode;
	actions?: ReactNode;
	className?: string;
};

/** Title 1 for app pages: every page heading starts at the same place. */
export function PageHeading({
	title,
	count,
	description,
	actions,
	className,
}: PageHeadingProps) {
	return (
		<div
			className={cn(
				"flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-2",
				className,
			)}
		>
			<div className="min-w-0 space-y-1">
				<div className="flex min-w-0 items-baseline gap-3">
					<h1 className="truncate font-serif text-[1.75rem] leading-9 font-semibold">
						{title}
					</h1>
					{count && (
						<p className="shrink-0 text-sm tabular-nums text-muted-foreground">
							{count}
						</p>
					)}
				</div>
				{description && (
					<p className="max-w-2xl text-sm text-muted-foreground">
						{description}
					</p>
				)}
			</div>
			{actions && (
				<div className="flex shrink-0 items-center gap-1.5">{actions}</div>
			)}
		</div>
	);
}
