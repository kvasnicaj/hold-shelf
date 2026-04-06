import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HomePage } from "#/components/home/home-page";
import { renderWithProviders } from "#/test/render";

type HomeLoaderData = {
	stats: {
		unread: number;
		total: number;
		readThisWeek: number;
		savedThisWeek: number;
	};
	recent: {
		recentlySaved: Array<{
			id: string;
			url: string;
			title: string | null;
			hostname: string | null;
			faviconUrl: string | null;
		}>;
		recentlyFavorite: Array<{
			id: string;
			url: string;
			title: string | null;
			hostname: string | null;
			faviconUrl: string | null;
		}>;
		oldestUnread: Array<{
			id: string;
			url: string;
			title: string | null;
			hostname: string | null;
			faviconUrl: string | null;
		}>;
	};
};

const { routeState } = vi.hoisted(() => ({
	routeState: {
		loaderData: {
			stats: {
				unread: 3,
				total: 5,
				readThisWeek: 2,
				savedThisWeek: 4,
			},
			recent: {
				recentlySaved: [],
				recentlyFavorite: [],
				oldestUnread: [],
			},
		} as HomeLoaderData,
	},
}));

vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);

	return {
		...actual,
		getRouteApi: () => ({
			useLoaderData: () => routeState.loaderData,
		}),
		Link: ({
			children,
			to,
			...props
		}: React.ComponentProps<"a"> & { to: string }) => (
			<a href={to} {...props}>
				{children}
			</a>
		),
	};
});

vi.mock("#/components/articles/save-article-toolbar-action", () => ({
	SaveArticleToolbarAction: () => null,
}));

vi.mock("#/components/articles/use-save-article", () => ({
	useSaveArticle: () => ({
		handleAdd: vi.fn(),
	}),
}));

describe("HomePage", () => {
	beforeEach(() => {
		routeState.loaderData = {
			stats: {
				unread: 3,
				total: 5,
				readThisWeek: 2,
				savedThisWeek: 4,
			},
			recent: {
				recentlySaved: [
					{
						id: "saved-1",
						url: "https://example.com/saved",
						title: "Saved article",
						hostname: "example.com",
						faviconUrl: null,
					},
				],
				recentlyFavorite: [
					{
						id: "favorite-1",
						url: "https://example.com/favorite",
						title: "Favorite article",
						hostname: "example.com",
						faviconUrl: null,
					},
				],
				oldestUnread: [
					{
						id: "unread-1",
						url: "https://example.com/unread",
						title: "Unread article",
						hostname: "example.com",
						faviconUrl: null,
					},
				],
			},
		};
	});

	it("renders the stats and recent sections from loader data", () => {
		renderWithProviders(<HomePage />);

		expect(screen.getByText("Welcome to Hold Shelf")).toBeInTheDocument();
		expect(screen.getAllByText("Unread")).not.toHaveLength(0);
		expect(screen.getAllByText("Total")).not.toHaveLength(0);
		expect(screen.getByText("Recently saved")).toBeInTheDocument();
		expect(screen.getByText("Favorites")).toBeInTheDocument();
		expect(screen.getByText("Oldest unread")).toBeInTheDocument();
		expect(screen.getByText("Saved article")).toBeInTheDocument();
		expect(screen.getByText("Favorite article")).toBeInTheDocument();
		expect(screen.getByText("Unread article")).toBeInTheDocument();
	});

	it("shows the empty library guidance when there are no articles", () => {
		routeState.loaderData = {
			stats: {
				unread: 0,
				total: 0,
				readThisWeek: 0,
				savedThisWeek: 0,
			},
			recent: {
				recentlySaved: [],
				recentlyFavorite: [],
				oldestUnread: [],
			},
		};

		renderWithProviders(<HomePage />);

		expect(screen.getByText("Your library is empty.")).toBeInTheDocument();
		expect(
			screen.getByText(/use the add article button in the top bar/i),
		).toBeInTheDocument();
	});
});
