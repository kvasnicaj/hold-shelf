import { Link } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { Button } from "#/components/ui/button";

export function LandingPage() {
	return (
		<div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6">
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,var(--lagoon)/0.06,transparent_70%)]" />

			<div className="rise-in relative z-10 flex max-w-lg flex-col items-center text-center">
				<div className="mb-8 flex size-16 items-center justify-center rounded-2xl bg-(--lagoon)/10 ring-1 ring-(--lagoon)/20">
					<Bookmark className="size-8 text-(--lagoon)" />
				</div>

				<h1 className="display-title text-5xl font-bold tracking-tight text-(--sea-ink) sm:text-6xl">
					Hold Shelf
				</h1>

				<p className="mt-4 text-lg leading-relaxed text-(--sea-ink-soft) sm:text-xl">
					A quiet place for the articles you&rsquo;ll actually read.
					<br className="hidden sm:block" />
					Save now, enjoy later.
				</p>

				<Button
					asChild
					size="lg"
					className="mt-10 text-primary-foreground! no-underline hover:text-primary-foreground!"
				>
					<Link to="/login">Get started</Link>
				</Button>
			</div>
		</div>
	);
}
