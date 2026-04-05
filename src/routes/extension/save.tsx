import { createFileRoute, redirect } from "@tanstack/react-router";
import { ExtensionSavePage } from "#/components/extension/extension-save-page";
import { getSession } from "#/server/auth";

type ExtensionSaveSearch = {
	url?: string;
};

export const Route = createFileRoute("/extension/save")({
	validateSearch: (search: Record<string, unknown>): ExtensionSaveSearch => ({
		url: typeof search.url === "string" ? search.url : undefined,
	}),
	beforeLoad: async ({ search }) => {
		if (!search.url) {
			return;
		}

		const session = await getSession();
		if (!session) {
			throw redirect({
				to: "/login",
				search: {
					redirectTo: `/extension/save?url=${encodeURIComponent(search.url)}`,
				},
			});
		}
	},
	component: ExtensionSaveRouteComponent,
});

function ExtensionSaveRouteComponent() {
	const { url } = Route.useSearch();
	return <ExtensionSavePage url={url} />;
}
