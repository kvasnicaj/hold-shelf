import { Link } from "@tanstack/react-router";
import { BrandLogo } from "#/components/brand/brand-logo";
import { AddToChromeButton } from "#/components/extension/add-to-chrome-button";
import { CookiePreferencesButton } from "#/components/privacy/cookie-preferences-button";
import { Button } from "#/components/ui/button";

export function LandingPage() {
	return (
		<div className="relative flex min-h-svh flex-col overflow-hidden px-6">
			<div className="flex flex-1 items-center justify-center">
				<div className="relative z-10 flex max-w-2xl flex-col items-center text-center">
					<h1>
						<BrandLogo variant="stacked" className="w-64 sm:w-80" decorative />
						<span className="sr-only">Hold Shelf</span>
					</h1>

					<p className="mt-4 text-lg leading-relaxed text-muted-foreground sm:text-xl">
						A quiet place for the articles you&rsquo;ll actually read.{" "}
						<br className="hidden sm:block" />
						Save now from the web app or straight from Chrome.
					</p>

					<div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
						<Button
							asChild
							size="lg"
							className="text-primary-foreground! no-underline hover:text-primary-foreground!"
						>
							<Link to="/login">Get started</Link>
						</Button>
					</div>

					<p className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
						<span>Also available as a Chrome extension.</span>
						<AddToChromeButton
							variant="link"
							className="h-auto px-0 text-sm font-medium text-primary no-underline hover:underline"
						/>
					</p>
				</div>
			</div>

			<footer className="relative z-10 flex justify-center pb-8 pt-4">
				<p className="text-sm text-muted-foreground">
					<Link
						to="/about"
						className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
					>
						About
					</Link>
					<span className="px-2">|</span>
					<Link
						to="/privacy"
						className="underline-offset-4 transition-colors hover:text-foreground hover:underline"
					>
						Privacy Policy
					</Link>
					<span className="px-2">|</span>
					<CookiePreferencesButton />
				</p>
			</footer>
		</div>
	);
}
