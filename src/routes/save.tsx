import { createFileRoute, redirect } from "@tanstack/react-router";
import { SavePage } from "#/components/save/save-page";
import { isSignedIn } from "#/server/auth";

type SaveSearch = {
	url?: string;
};

export const Route = createFileRoute("/save")({
	validateSearch: (search: Record<string, unknown>): SaveSearch => ({
		url: typeof search.url === "string" ? search.url : undefined,
	}),
	beforeLoad: async ({ search }) => {
		if (!search.url) return;

		if (!(await isSignedIn())) {
			throw redirect({
				to: "/login",
				search: {
					redirectTo: `/save?url=${encodeURIComponent(search.url)}`,
				},
			});
		}
	},
	component: SaveRouteComponent,
});

function SaveRouteComponent() {
	const { url } = Route.useSearch();
	return <SavePage url={url} />;
}
