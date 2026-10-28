import { ArrowLeft } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { PublicPageHeading } from "#/components/public/public-page-heading";
import { PublicPageLayout } from "#/components/public/public-page-layout";
import { PublicSection } from "#/components/public/public-section";
import { Button } from "#/components/ui/button";

export function AboutPage() {
	return (
		<PublicPageLayout
			actions={
				<Button asChild variant="ghost">
					<Link to="/" className="text-foreground no-underline">
						<ArrowLeft />
						Home
					</Link>
				</Button>
			}
		>
			<div className="space-y-10">
				<PublicPageHeading
					title="About Hold Shelf"
					description="A simple reading shelf for the things worth coming back to."
				/>
				<PublicSection title="What the app is for">
					<p>
						Hold Shelf is a read-it-later app for saving articles you want to
						keep, without turning your reading list into noise.
					</p>
					<p>
						You can save links from the web app or from the browser extension,
						then come back to them when you actually have time to read.
					</p>
				</PublicSection>

				<PublicSection title="How it feels">
					<p>
						The goal is to keep reading calm and intentional. Hold Shelf gives
						you a quiet place to collect useful articles, organize them, and
						pick them up later without clutter.
					</p>
				</PublicSection>

				<PublicSection title="Contact">
					<p>
						For questions, feedback, or support, email{" "}
						<a
							href="mailto:info@hold-shelf.com"
							className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
						>
							info@hold-shelf.com
						</a>
						.
					</p>
				</PublicSection>
			</div>
		</PublicPageLayout>
	);
}
