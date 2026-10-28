import type { ReactNode } from "react";
import { cn } from "#/lib/utils";

type PublicPageHeadingProps = {
	title: ReactNode;
	description?: ReactNode;
	eyebrow?: ReactNode;
	align?: "start" | "center";
	children?: ReactNode;
};

export function PublicPageHeading({
	title,
	description,
	eyebrow,
	align = "start",
	children,
}: PublicPageHeadingProps) {
	return (
		<header
			className={cn(
				"space-y-3",
				align === "center" && "flex flex-col items-center text-center",
			)}
		>
			{eyebrow ? (
				<p className="text-sm font-semibold text-muted-foreground">{eyebrow}</p>
			) : null}
			<h1 className="font-serif text-[2rem] leading-tight font-semibold text-balance sm:text-[2.5rem]">
				{title}
			</h1>
			{description ? (
				<p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
					{description}
				</p>
			) : null}
			{children}
		</header>
	);
}
