import { createFileRoute, notFound } from "@tanstack/react-router";
import { SharedTagPage } from "#/components/shared-tag/shared-tag-page";
import { SharedTagUnavailablePage } from "#/components/shared-tag/shared-tag-unavailable-page";
import { TAG_SHARE_TOKEN_PATTERN } from "#/lib/shared-tag";
import { getSharedTag } from "#/server/tag-shares";

type SharedTagSearch = {
	page?: number;
};

export const Route = createFileRoute("/share/$token")({
	validateSearch: (search: Record<string, unknown>): SharedTagSearch => ({
		page:
			typeof search.page === "number" &&
			Number.isInteger(search.page) &&
			search.page > 1 &&
			search.page <= 10_000
				? search.page
				: undefined,
	}),
	loaderDeps: ({ search }) => search,
	loader: async ({ params, deps }) => {
		if (!TAG_SHARE_TOKEN_PATTERN.test(params.token)) {
			throw notFound();
		}
		const sharedTag = await getSharedTag({
			data: { token: params.token, page: deps.page },
		});
		if (!sharedTag) {
			throw notFound();
		}
		return sharedTag;
	},
	head: ({ loaderData }) => ({
		meta: [
			{
				title: loaderData
					? `${loaderData.ownerFirstName}'s shared articles | Hold Shelf`
					: "Shared articles | Hold Shelf",
			},
			{ name: "robots", content: "noindex, nofollow" },
			{ name: "referrer", content: "no-referrer" },
		],
	}),
	notFoundComponent: SharedTagUnavailablePage,
	component: SharedTagPage,
});
