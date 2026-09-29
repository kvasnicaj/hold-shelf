import { useQueryClient } from "@tanstack/react-query";
import { getRouteApi, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { useArticleReader } from "#/components/article-reader/use-article-reader";
import { updateArticle } from "#/server/articles";

const appRoute = getRouteApi("/app");

export function useAutoMarkReadOnOpen() {
	const { settings } = appRoute.useLoaderData();
	const queryClient = useQueryClient();
	const router = useRouter();
	const { openArticle } = useArticleReader();

	async function handleOpenArticle(id: string, isRead: boolean) {
		openArticle(id);

		if (!settings.markReadOnOpen || isRead) {
			return;
		}

		try {
			await updateArticle({ data: { id, isRead: true } });
		} catch {
			toast.error(
				"Could not mark this article as read. Try again from the reader.",
			);
		}
		void queryClient.invalidateQueries({ queryKey: ["articles"] });
		void queryClient.invalidateQueries({ queryKey: ["article-reader", id] });
		void router.invalidate();
	}

	return {
		markReadOnOpen: settings.markReadOnOpen,
		handleOpenArticle,
	};
}
