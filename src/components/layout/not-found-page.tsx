import { Link } from "@tanstack/react-router";
import { BrandLogo } from "#/components/brand/brand-logo";

export function NotFoundPage() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
			<BrandLogo className="mb-4" />
			<h1 className="display-title text-6xl font-bold text-foreground">404</h1>
			<p className="text-lg text-muted-foreground">This page doesn't exist.</p>
			<Link
				to="/app/home"
				className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground no-underline hover:bg-primary/90"
			>
				Go home
			</Link>
		</div>
	);
}
