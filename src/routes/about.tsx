import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "#/components/about/about-page";
import {
	ABOUT_PAGE_CANONICAL_URL,
	ABOUT_PAGE_DESCRIPTION,
	ABOUT_PAGE_TITLE,
} from "#/components/about/helpers";

export const Route = createFileRoute("/about")({
	head: () => ({
		meta: [
			{ title: ABOUT_PAGE_TITLE },
			{ name: "description", content: ABOUT_PAGE_DESCRIPTION },
			{ property: "og:title", content: ABOUT_PAGE_TITLE },
			{ property: "og:description", content: ABOUT_PAGE_DESCRIPTION },
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: ABOUT_PAGE_CANONICAL_URL },
			{ name: "twitter:card", content: "summary" },
			{ name: "twitter:title", content: ABOUT_PAGE_TITLE },
			{ name: "twitter:description", content: ABOUT_PAGE_DESCRIPTION },
		],
		links: [{ rel: "canonical", href: ABOUT_PAGE_CANONICAL_URL }],
	}),
	component: AboutPage,
});
