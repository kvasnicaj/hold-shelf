import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { ContinueReadingSection } from "#/components/home/continue-reading-section";
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
vi.mock("@tanstack/react-router", () => ({
	useRouter: () => ({ invalidate: vi.fn() }),
}));
vi.mock("#/components/articles/use-auto-mark-read-on-open", () => ({
	useAutoMarkReadOnOpen: () => ({ handleOpenArticle: vi.fn() }),
}));
vi.mock("#/components/article-reader/use-article-reader", () => ({
	useArticleReader: () => ({ openArticle: vi.fn() }),
}));
it("completes a partially read article even when opening already marked it read", async () => {
	const user = userEvent.setup();
	vi.mocked(getContinueReading).mockResolvedValue([
		{
			id: "a1",
			title: "My article",
			url: "https://example.com",
			isRead: true,
			progress: 3500,
		},
	]);
	vi.mocked(finishReading).mockImplementation(async () => {
		vi.mocked(getContinueReading).mockResolvedValue([]);
		return { success: true };
	});
	renderWithProviders(<ContinueReadingSection />);
	await user.click(
		await screen.findByRole("button", { name: "Mark My article as read" }),
	);
	expect(finishReading).toHaveBeenCalledWith({ data: { id: "a1" } });
	await waitFor(() =>
		expect(
			screen.queryByRole("region", { name: "Continue reading" }),
		).not.toBeInTheDocument(),
	);
});
