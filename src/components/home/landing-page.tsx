import { Link } from "@tanstack/react-router";
import { AddToChromeButton } from "#/components/extension/add-to-chrome-button";
import { LANDING_FEATURES } from "#/components/home/helpers";
import { LandingPreview } from "#/components/home/landing-preview";
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
			<section className="grid items-center gap-10 py-4 sm:py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-14">
				<div className="max-w-xl space-y-6">
					<h1 className="font-serif text-[2.5rem] leading-[1.08] font-semibold tracking-[-0.01em] text-balance sm:text-[3.25rem]">
						Save the article now. Read it properly later.
					</h1>
					<p className="text-lg leading-relaxed text-muted-foreground">
						Hold Shelf keeps the text of every link you save and remembers how
						far you got, so a long read can wait until you have time for it.
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
				</div>
				<LandingPreview />
			</section>

			<section
				aria-label="What Hold Shelf does"
				className="mt-12 grid gap-8 border-t-2 border-foreground pt-6 sm:grid-cols-3"
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
