import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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
			isRead: boolean;
			createdAt?: Date | null;
			tags: Array<{ id: string; name: string; color: string | null }>;
		}>;
		recentlyFavorite: Array<{
			id: string;
			url: string;
			title: string | null;
			hostname: string | null;
			faviconUrl: string | null;
			isRead: boolean;
			createdAt?: Date | null;
		}>;
		oldestUnread: Array<{
			id: string;
			url: string;
			title: string | null;
			hostname: string | null;
			faviconUrl: string | null;
			isRead: boolean;
			createdAt?: Date | null;
		}>;
	};
	tags: Array<{ id: string; name: string; color: string | null }>;
};

const {
	routeState,
	handleAddTagMock,
	handleRemoveTagMock,
	handleCreateTagMock,
} = vi.hoisted(() => ({
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
			tags: [],
		} as HomeLoaderData,
	},
	handleAddTagMock: vi.fn(),
	handleRemoveTagMock: vi.fn(),
	handleCreateTagMock: vi.fn(),
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

vi.mock("#/components/articles/use-auto-mark-read-on-open", () => ({
	useAutoMarkReadOnOpen: () => ({
		markReadOnOpen: true,
		handleOpenArticle: vi.fn().mockResolvedValue(undefined),
	}),
}));

vi.mock("#/components/articles/use-article-mutations", () => ({
	useArticleMutations: () => ({
		handleAddTag: handleAddTagMock,
		handleRemoveTag: handleRemoveTagMock,
		handleCreateTag: handleCreateTagMock,
	}),
}));

describe("HomePage", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date("2026-07-03T12:00:00.000Z"));
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
						isRead: false,
						createdAt: new Date("2026-07-01T12:00:00.000Z"),
						tags: [{ id: "t1", name: "Design", color: null }],
					},
				],
				recentlyFavorite: [
					{
						id: "favorite-1",
						url: "https://example.com/favorite",
						title: "Favorite article",
						hostname: "example.com",
						faviconUrl: null,
						isRead: true,
						createdAt: new Date("2026-07-02T12:00:00.000Z"),
					},
				],
				oldestUnread: [
					{
						id: "unread-1",
						url: "https://example.com/unread",
						title: "Unread article",
						hostname: "example.com",
						faviconUrl: null,
						isRead: false,
						createdAt: new Date("2026-04-05T12:00:00.000Z"),
					},
				],
			},
			tags: [
				{ id: "t1", name: "Design", color: null },
				{ id: "t2", name: "Research", color: null },
			],
		};
	});

	afterEach(() => {
		vi.useRealTimers();
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
		expect(screen.getByText("Unread for 89 days")).toBeInTheDocument();
		expect(screen.getByTitle("Manage tags")).toBeInTheDocument();
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
			tags: [],
		};

		renderWithProviders(<HomePage />);

		expect(screen.getByText("Your library is empty.")).toBeInTheDocument();
		expect(
			screen.getByText(/use the add article button in the top bar/i),
		).toBeInTheDocument();
	});

	it("keeps the oldest unread widget visible when there are no unread articles", () => {
		routeState.loaderData = {
			stats: {
				unread: 0,
				total: 1,
				readThisWeek: 1,
				savedThisWeek: 1,
			},
			recent: {
				recentlySaved: [
					{
						id: "saved-1",
						url: "https://example.com/saved",
						title: "Saved article",
						hostname: "example.com",
						faviconUrl: null,
						isRead: true,
						createdAt: new Date("2026-07-02T12:00:00.000Z"),
						tags: [],
					},
				],
				recentlyFavorite: [],
				oldestUnread: [],
			},
			tags: [],
		};

		renderWithProviders(<HomePage />);

		expect(screen.getByText("Oldest unread")).toBeInTheDocument();
		expect(
			screen.getByText("No unread articles right now."),
		).toBeInTheDocument();
	});
});
