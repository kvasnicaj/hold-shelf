import { Link } from "@tanstack/react-router";
import { CookiePreferencesButton } from "#/components/privacy/cookie-preferences-button";

export function PublicPageFooter() {
	return (
		<footer className="border-t py-6">
			<p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
				<Link
					to="/about"
					className="text-muted-foreground no-underline hover:text-foreground hover:underline"
				>
					About
				</Link>
				<span aria-hidden="true">·</span>
				<Link
					to="/privacy"
					className="text-muted-foreground no-underline hover:text-foreground hover:underline"
				>
					Privacy Policy
				</Link>
				<span aria-hidden="true">·</span>
				<CookiePreferencesButton />
			</p>
		</footer>
	);
}
