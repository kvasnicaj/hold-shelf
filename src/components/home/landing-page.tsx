import { Link } from "@tanstack/react-router";
import { AddToChromeButton } from "#/components/extension/add-to-chrome-button";
import { LANDING_FEATURES } from "#/components/home/helpers";
import { PublicPageLayout } from "#/components/public/public-page-layout";
import { Button } from "#/components/ui/button";

export function LandingPage() {
	return (
		<PublicPageLayout
			width="wide"
			actions={
				<Button asChild variant="ghost">
					<Link to="/login" className="text-foreground no-underline">
						Sign in
					</Link>
				</Button>
			}
		>
			<section className="max-w-2xl space-y-6 py-4 sm:py-12">
				<h1 className="font-serif text-[2.5rem] leading-[1.08] font-semibold tracking-[-0.01em] text-balance sm:text-[3.25rem]">
					A quiet place for the articles you&rsquo;ll actually read.
				</h1>
				<p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
					Save links from the web app or straight from Chrome. Hold Shelf keeps
					the text, remembers where you stopped, and waits until you have time.
				</p>
				<div className="space-y-3">
					<Button asChild size="lg">
						<Link to="/login" className="no-underline">
							Get started
						</Link>
					</Button>
					<p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
						<span>Also available as a Chrome extension.</span>
						<AddToChromeButton
							variant="link"
							className="h-auto px-0 text-sm font-semibold no-underline hover:underline has-[>svg]:px-0"
						/>
					</p>
				</div>
			</section>

			<section
				aria-label="What Hold Shelf does"
				className="mt-14 grid gap-8 border-t-2 border-foreground pt-6 sm:grid-cols-3"
			>
				{LANDING_FEATURES.map((feature) => (
					<div key={feature.title} className="space-y-2">
						<h2 className="font-serif text-lg font-semibold">
							{feature.title}
						</h2>
						<p className="text-[15px] leading-relaxed text-muted-foreground">
							{feature.text}
						</p>
					</div>
				))}
			</section>
		</PublicPageLayout>
	);
}
