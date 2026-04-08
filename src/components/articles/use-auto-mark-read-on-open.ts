import { useQueryClient } from "@tanstack/react-query";
import { getRouteApi, useRouter } from "@tanstack/react-router";
import { updateArticle } from "#/server/articles";

const appRoute = getRouteApi("/app");

export function useAutoMarkReadOnOpen() {
	const { settings } = appRoute.useLoaderData();
	const queryClient = useQueryClient();
	const router = useRouter();

	async function handleOpenArticle(id: string, isRead: boolean) {
		if (!settings.markReadOnOpen || isRead) {
			return;
		}

		await updateArticle({ data: { id, isRead: true } });
		void queryClient.invalidateQueries({ queryKey: ["articles"] });
		void router.invalidate();
	}

	return {
		markReadOnOpen: settings.markReadOnOpen,
		handleOpenArticle,
	};
}
