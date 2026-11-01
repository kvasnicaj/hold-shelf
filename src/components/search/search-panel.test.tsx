import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SearchPanel } from "#/components/search/search-panel";
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

vi.mock("#/components/articles/use-open-article", () => ({
	useOpenArticle: () => ({
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

describe("SearchPanel", () => {
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
		renderWithProviders(<SearchPanel />);

		await user.type(
			screen.getByPlaceholderText("Search all saved articles..."),
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
		renderWithProviders(<SearchPanel />);

		await user.type(
			screen.getByPlaceholderText("Search all saved articles..."),
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
		renderWithProviders(<SearchPanel />);

		const search = screen.getByPlaceholderText("Search all saved articles...");
		await user.type(search, "rust{Enter}");

		expect(navigateMock).toHaveBeenCalledWith({
			to: "/app/archive",
			search: { q: "rust" },
		});
	});
	it("reports searching, not an empty result, until the typed query has answered", async () => {
		const user = userEvent.setup();
		let finish: (value: unknown) => void = () => {};
		getArticlesMock.mockReturnValue(
			new Promise((resolve) => {
				finish = resolve;
			}),
		);
		renderWithProviders(<SearchPanel />);

		await user.type(
			screen.getByPlaceholderText("Search all saved articles..."),
			"react",
		);

		await waitFor(() => expect(getArticles).toHaveBeenCalled());
		expect(screen.getByRole("status")).toHaveTextContent("Searching…");
		expect(
			screen.queryByText(/no saved articles match/i),
		).not.toBeInTheDocument();

		finish({ items: [], total: 0 });
		expect(
			await screen.findByText("No saved articles match “react”."),
		).toBeInTheDocument();
	});

	it("explains a failed search and retries it", async () => {
		const user = userEvent.setup();
		getArticlesMock.mockRejectedValueOnce(new Error("offline"));
		renderWithProviders(<SearchPanel />);

		await user.type(
			screen.getByPlaceholderText("Search all saved articles..."),
			"react",
		);

		expect(await screen.findByRole("alert")).toHaveTextContent(
			"Search could not reach your library.",
		);
		expect(
			screen.queryByText(/no saved articles match/i),
		).not.toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Try again" }));
		expect(
			await screen.findByRole("button", { name: /design systems guide/i }),
		).toBeInTheDocument();
	});

	it("shows the saved passage for a match found only in the article text", async () => {
		const user = userEvent.setup();
		getArticlesMock.mockResolvedValue({
			items: [
				{
					...article,
					title: "Notes from the week",
					description: "Links and thoughts.",
					matchExcerpt:
						"ing the old patterns, Server Components move data fetching to the server. Th",
				},
			],
			total: 1,
		});
		renderWithProviders(<SearchPanel />);

		await user.type(
			screen.getByPlaceholderText("Search all saved articles..."),
			"server components",
		);

		const result = await screen.findByRole("button", {
			name: /notes from the week/i,
		});
		expect(result).toHaveTextContent(
			"…the old patterns, Server Components move data fetching to the server.…",
		);
	});

	it("offers visible close and Library actions", async () => {
		const user = userEvent.setup();
		const onClose = vi.fn();
		renderWithProviders(<SearchPanel onClose={onClose} />);

		const showAll = screen.getByRole("button", {
			name: /type to search the library/i,
		});
		expect(showAll).toBeDisabled();

		await user.type(
			screen.getByPlaceholderText("Search all saved articles..."),
			"rust",
		);
		await user.click(
			screen.getByRole("button", { name: /show all matches in library/i }),
		);
		expect(navigateMock).toHaveBeenCalledWith({
			to: "/app/archive",
			search: { q: "rust" },
		});

		await user.click(screen.getByRole("button", { name: "Close search" }));
		expect(onClose).toHaveBeenCalled();
	});
});
