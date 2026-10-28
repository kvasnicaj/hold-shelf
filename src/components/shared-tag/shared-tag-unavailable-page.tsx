import { Link } from "@tanstack/react-router";
import { PublicPageHeading } from "#/components/public/public-page-heading";
import { PublicPageLayout } from "#/components/public/public-page-layout";
import { Button } from "#/components/ui/button";

export function SharedTagUnavailablePage() {
	return (
		<PublicPageLayout centered>
			<PublicPageHeading
				align="center"
				title="This shared shelf is unavailable"
				description="The link may have been stopped or may no longer exist."
			>
				<Button asChild variant="outline" className="mt-3">
					<Link to="/" className="text-foreground no-underline">
						Go to Hold Shelf
					</Link>
				</Button>
			</PublicPageHeading>
		</PublicPageLayout>
	);
}
