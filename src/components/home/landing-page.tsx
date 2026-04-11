import { Link } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { AddToChromeButton } from "#/components/extension/add-to-chrome-button";
import { Button } from "#/components/ui/button";

export function LandingPage() {
	return (
		<div className="relative flex min-h-svh flex-col overflow-hidden px-6">
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,var(--lagoon)/0.06,transparent_70%)]" />

			<div className="flex flex-1 items-center justify-center">
				<div className="rise-in relative z-10 flex max-w-2xl flex-col items-center text-center">
					<div className="mb-8 flex size-16 items-center justify-center rounded-2xl bg-(--lagoon)/10 ring-1 ring-(--lagoon)/20">
						<Bookmark className="size-8 text-(--lagoon)" />
					</div>

					<h1 className="display-title text-5xl font-bold tracking-tight text-(--sea-ink) sm:text-6xl">
						Hold Shelf
					</h1>

					<p className="mt-4 text-lg leading-relaxed text-(--sea-ink-soft) sm:text-xl">
						A quiet place for the articles you&rsquo;ll actually read.
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

					<p className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-(--sea-ink-soft)">
						<span>Also available as a Chrome extension.</span>
						<AddToChromeButton
							variant="link"
							className="h-auto px-0 text-sm font-medium text-(--lagoon) no-underline hover:text-(--lagoon) hover:underline"
						/>
					</p>
				</div>
			</div>

			<footer className="relative z-10 flex justify-center pb-8 pt-4">
				<p className="text-sm text-(--sea-ink-soft)">
					<Link
						to="/about"
						className="underline-offset-4 transition-colors hover:text-(--sea-ink) hover:underline"
					>
						About
					</Link>
					<span className="px-2">|</span>
					<Link
						to="/privacy"
						className="underline-offset-4 transition-colors hover:text-(--sea-ink) hover:underline"
					>
						Privacy Policy
					</Link>
				</p>
			</footer>
		</div>
	);
}
