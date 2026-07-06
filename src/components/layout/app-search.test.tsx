import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppSearch } from "#/components/layout/app-search";
import { getArticles } from "#/server/articles";
import { renderWithProviders } from "#/test/render";

const { navigateMock, handleOpenArticleMock, getArticlesMock } = vi.hoisted(
	() => ({
		navigateMock: vi.fn(),
		handleOpenArticleMock: vi.fn(),
		getArticlesMock: vi.fn(),
	}),
);

vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);

	return {
		...actual,
		useNavigate: () => navigateMock,
	};
});

vi.mock("#/components/articles/use-auto-mark-read-on-open", () => ({
	useAutoMarkReadOnOpen: () => ({
		handleOpenArticle: handleOpenArticleMock,
	}),
}));

vi.mock("#/server/articles", () => ({
	getArticles: getArticlesMock,
}));

const article = {
	id: "a1",
	url: "https://example.com/design",
	title: "Design systems guide",
	description: "A practical guide to searchable previews.",
	hostname: "example.com",
	faviconUrl: null,
	isRead: false,
	isFavorite: false,
	createdAt: new Date("2024-01-01T00:00:00.000Z"),
	tags: [],
};

describe("AppSearch", () => {
	beforeEach(() => {
		navigateMock.mockReset();
		handleOpenArticleMock.mockReset().mockResolvedValue(undefined);
		getArticlesMock.mockReset().mockResolvedValue({
			items: [article],
			total: 1,
		});
	});

	it("searches saved articles globally and shows highlighted previews", async () => {
		const user = userEvent.setup();
		renderWithProviders(<AppSearch />);

		await user.type(
			screen.getByPlaceholderText("Search saved articles..."),
			"design",
		);

		await waitFor(() =>
			expect(getArticles).toHaveBeenCalledWith({
				data: { search: "design", limit: 6 },
			}),
		);
		const result = screen.getByRole("button", {
			name: /designsystems guide/i,
		});
		expect(result).toHaveTextContent("Design systems guide");
		expect(screen.getByText("Design")).toBeInTheDocument();

		await user.click(result);
		await waitFor(() =>
			expect(navigateMock).toHaveBeenCalledWith({
				to: "/app/archive",
				search: { q: "design" },
			}),
		);
		expect(handleOpenArticleMock).toHaveBeenCalledWith("a1", false);
	});

	it("shows source matches in previews and opens clicked results from archive", async () => {
		const user = userEvent.setup();
		getArticlesMock.mockResolvedValue({
			items: [
				{
					...article,
					id: "a2",
					url: "https://css-tricks.com/guides/grid",
					title: "Layout notes",
					description: "A practical frontend guide.",
					hostname: "css-tricks.com",
					isRead: true,
				},
			],
			total: 1,
		});
		renderWithProviders(<AppSearch />);

		await user.type(
			screen.getByPlaceholderText("Search saved articles..."),
			"css-tricks",
		);

		await waitFor(() =>
			expect(getArticles).toHaveBeenCalledWith({
				data: { search: "css-tricks", limit: 6 },
			}),
		);
		expect(screen.getByText("https://")).toBeInTheDocument();
		expect(screen.getByText("css-tricks")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: /Layout notes/ }));
		await waitFor(() =>
			expect(navigateMock).toHaveBeenCalledWith({
				to: "/app/archive",
				search: { q: "css-tricks" },
			}),
		);
		expect(handleOpenArticleMock).toHaveBeenCalledWith("a2", true);
	});

	it("submits searches to the archive results page", async () => {
		const user = userEvent.setup();
		renderWithProviders(<AppSearch />);

		const search = screen.getByPlaceholderText("Search saved articles...");
		await user.type(search, "rust{Enter}");

		expect(navigateMock).toHaveBeenCalledWith({
			to: "/app/archive",
			search: { q: "rust" },
		});
	});
});
