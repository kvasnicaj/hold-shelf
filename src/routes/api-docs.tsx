import { createFileRoute } from "@tanstack/react-router";
import { ApiDocsPage } from "#/components/api-docs/api-docs-page";
import {
	API_DOCS_PAGE_CANONICAL_URL,
	API_DOCS_PAGE_DESCRIPTION,
	API_DOCS_PAGE_TITLE,
} from "#/components/api-docs/helpers";

export const Route = createFileRoute("/api-docs")({
	head: () => ({
		meta: [
			{ title: API_DOCS_PAGE_TITLE },
			{ name: "description", content: API_DOCS_PAGE_DESCRIPTION },
			{ property: "og:title", content: API_DOCS_PAGE_TITLE },
			{ property: "og:description", content: API_DOCS_PAGE_DESCRIPTION },
			{ property: "og:type", content: "website" },
			{ property: "og:url", content: API_DOCS_PAGE_CANONICAL_URL },
			{ name: "twitter:card", content: "summary" },
			{ name: "twitter:title", content: API_DOCS_PAGE_TITLE },
			{ name: "twitter:description", content: API_DOCS_PAGE_DESCRIPTION },
		],
		links: [{ rel: "canonical", href: API_DOCS_PAGE_CANONICAL_URL }],
	}),
	component: ApiDocsPage,
});
