import { createFileRoute, redirect } from "@tanstack/react-router";

type ExtensionSaveSearch = {
	url?: string;
};

export const Route = createFileRoute("/extension/save")({
	validateSearch: (search: Record<string, unknown>): ExtensionSaveSearch => ({
		url: typeof search.url === "string" ? search.url : undefined,
	}),
	beforeLoad: ({ search }) => {
		throw redirect({
			to: "/save",
			search: { url: search.url },
			replace: true,
		});
	},
	component: () => null,
});
