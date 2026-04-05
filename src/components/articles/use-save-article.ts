import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { createArticle } from "#/server/articles";

export function useSaveArticle() {
	const queryClient = useQueryClient();
	const router = useRouter();

	async function handleAdd(url: string) {
		await createArticle({ data: { url } });
		queryClient.invalidateQueries({ queryKey: ["articles"] });
		queryClient.invalidateQueries({ queryKey: ["tags"] });
		router.invalidate();
	}

	return { handleAdd };
}
