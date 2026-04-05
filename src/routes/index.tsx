import { createFileRoute, redirect } from "@tanstack/react-router";
import {
	LANDING_PAGE_CANONICAL_URL,
	LANDING_PAGE_DESCRIPTION,
	LANDING_PAGE_OG_IMAGE_URL,
	LANDING_PAGE_TITLE,
} from "#/components/home/helpers";
import { LandingPage } from "#/components/home/landing-page";
import { getSession } from "#/server/auth";

export const Route = createFileRoute("/")({
	beforeLoad: async () => {
		const session = await getSession();
		if (session) {
			throw redirect({ to: "/app/home" });
		}
	},
	head: () => ({
		meta: [
			{ title: LANDING_PAGE_TITLE },
			{ name: "description", content: LANDING_PAGE_DESCRIPTION },
			{ property: "og:title", content: LANDING_PAGE_TITLE },
			{ property: "og:description", content: LANDING_PAGE_DESCRIPTION },
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: LANDING_PAGE_CANONICAL_URL },
			{ property: "og:image", content: LANDING_PAGE_OG_IMAGE_URL },
			{ property: "og:site_name", content: "Hold Shelf" },
			{ name: "twitter:card", content: "summary" },
			{ name: "twitter:title", content: LANDING_PAGE_TITLE },
			{ name: "twitter:description", content: LANDING_PAGE_DESCRIPTION },
			{ name: "twitter:image", content: LANDING_PAGE_OG_IMAGE_URL },
		],
		links: [{ rel: "canonical", href: LANDING_PAGE_CANONICAL_URL }],
	}),
	component: LandingPage,
});
