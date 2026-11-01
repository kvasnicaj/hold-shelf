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
					description="A read-it-later app for articles you mean to come back to."
				/>
				<PublicSection title="What the app is for">
					<p>
						Save links from the web app or the Chrome extension, then come back
						to them when you have time to read.
					</p>
				</PublicSection>

				<PublicSection title="How it works">
					<p>
						Saving a link stores the article&rsquo;s text, so it stays readable
						if the page changes later. The reader keeps your place as you
						scroll, and Home shows what you were reading and what has waited
						longest.
					</p>
					<p>
						Tags and favorites are there when you want to organize, and stay out
						of the way when you don&rsquo;t.
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
