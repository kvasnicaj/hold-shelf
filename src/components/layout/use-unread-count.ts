import { useQuery } from "@tanstack/react-query";
import { getArticles } from "#/server/articles";

export function useUnreadCount() {
	const { data } = useQuery({
		queryKey: ["articles", "unread-count"],
		queryFn: () => getArticles({ data: { isRead: false, limit: 1 } }),
	});

	return data?.total ?? 0;
}
