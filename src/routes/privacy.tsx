import { createFileRoute } from "@tanstack/react-router";
import {
	PRIVACY_PAGE_CANONICAL_URL,
	PRIVACY_PAGE_DESCRIPTION,
	PRIVACY_PAGE_TITLE,
} from "#/components/privacy/helpers";
import { PrivacyPage } from "#/components/privacy/privacy-page";

export const Route = createFileRoute("/privacy")({
	head: () => ({
		meta: [
			{ title: PRIVACY_PAGE_TITLE },
			{ name: "description", content: PRIVACY_PAGE_DESCRIPTION },
			{ property: "og:title", content: PRIVACY_PAGE_TITLE },
			{ property: "og:description", content: PRIVACY_PAGE_DESCRIPTION },
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: PRIVACY_PAGE_CANONICAL_URL },
			{ name: "twitter:card", content: "summary" },
			{ name: "twitter:title", content: PRIVACY_PAGE_TITLE },
			{ name: "twitter:description", content: PRIVACY_PAGE_DESCRIPTION },
		],
		links: [{ rel: "canonical", href: PRIVACY_PAGE_CANONICAL_URL }],
	}),
	component: PrivacyPage,
});
