import { Link } from "@tanstack/react-router";
import { PublicPageHeading } from "#/components/public/public-page-heading";
import { PublicPageLayout } from "#/components/public/public-page-layout";
import { Button } from "#/components/ui/button";

export function NotFoundPage() {
	return (
		<PublicPageLayout centered>
			<PublicPageHeading
				align="center"
				eyebrow="404"
				title="This page isn't on the shelf"
				description="The link may be old, or the page may have moved."
			>
				<Button asChild className="mt-3">
					<Link to="/app/home" className="no-underline">
						Go to your shelf
					</Link>
				</Button>
			</PublicPageHeading>
		</PublicPageLayout>
	);
}
