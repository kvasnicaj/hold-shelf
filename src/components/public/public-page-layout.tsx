import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { BrandLogo } from "#/components/brand/brand-logo";
import { PublicPageFooter } from "#/components/public/public-page-footer";
import { cn } from "#/lib/utils";

type PublicPageLayoutProps = {
	children: ReactNode;
	/** Shown at the right of the top bar, e.g. a sign-in or back link. */
	actions?: ReactNode;
	/** "prose" for reading pages, "wide" for documentation and lists. */
	width?: "prose" | "wide";
	/** Center the content vertically, for short status pages. */
	centered?: boolean;
};

export function PublicPageLayout({
	children,
	actions,
	width = "prose",
	centered = false,
}: PublicPageLayoutProps) {
	return (
		<div className="flex min-h-svh flex-col bg-background">
			<header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
				<Link
					to="/"
					className="inline-flex no-underline"
					aria-label="Hold Shelf home"
				>
					<BrandLogo className="h-7" decorative />
				</Link>
				{actions ? (
					<div className="flex items-center gap-2">{actions}</div>
				) : null}
			</header>
			<main
				className={cn(
					"mx-auto flex w-full min-w-0 flex-1 flex-col px-5 pb-16 sm:px-8",
					width === "prose" ? "max-w-3xl" : "max-w-5xl",
					centered ? "justify-center pt-6" : "pt-8 sm:pt-12",
				)}
			>
				{children}
			</main>
			<div className="mx-auto w-full max-w-5xl px-5 sm:px-8">
				<PublicPageFooter />
			</div>
		</div>
	);
}
