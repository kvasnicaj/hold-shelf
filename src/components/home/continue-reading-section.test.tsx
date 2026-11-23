import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { HomePage } from "#/components/home/home-page";
import { finishReading, getContinueReading } from "#/server/library";
import { renderWithProviders } from "#/test/render";

vi.mock("#/server/articles", () => ({
	deleteArticles: vi.fn(),
	updateArticle: vi.fn(),
}));
vi.mock("#/server/tags", () => ({
	addTagToArticles: vi.fn(),
	removeTagFromArticles: vi.fn(),
	createTag: vi.fn(),
}));
const { homeLoader } = vi.hoisted(() => ({ homeLoader: vi.fn() }));
vi.mock("@tanstack/react-router", () => ({
	getRouteApi: () => ({ useLoaderData: homeLoader }),
	Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
		<a href={to}>{children}</a>
	),
	useRouter: () => ({ invalidate: vi.fn() }),
}));
vi.mock("#/components/articles/use-open-article", () => ({
	useOpenArticle: () => ({ handleOpenArticle: vi.fn() }),
}));
vi.mock("#/components/article-reader/use-article-reader", () => ({
	useArticleReader: () => ({ openArticle: vi.fn() }),
}));
it("completes a partially read article even when opening already marked it read", async () => {
	const user = userEvent.setup();
	const initialData = [
		{
			id: "a1",
			title: "My article",
			url: "https://example.com",
			hostname: "example.com",
			faviconUrl: null,
			isRead: true,
			progress: 3500,
		},
	];
	vi.mocked(finishReading).mockImplementation(async () => {
		vi.mocked(getContinueReading).mockResolvedValue([]);
		return { success: true };
	});
	homeLoader.mockReturnValue({
		continueReading: initialData,
		stats: { total: 1, unread: 0, readThisWeek: 1, savedThisWeek: 1 },
		recent: {
			latestUnread: [],
			oldestUnread: [],
			recentlySaved: [],
			recentlyFavorite: [],
		},
		tags: [],
	});
	renderWithProviders(<HomePage />);
	await user.click(
		await screen.findByRole("button", { name: "Mark as read: My article" }),
	);
	expect(finishReading).toHaveBeenCalledWith({ data: { id: "a1" } });
	await waitFor(() =>
		expect(
			screen.queryByRole("region", { name: "Continue reading" }),
		).not.toBeInTheDocument(),
	);
});
