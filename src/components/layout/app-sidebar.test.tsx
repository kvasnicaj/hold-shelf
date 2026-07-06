import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppSidebar } from "#/components/layout/app-sidebar";
import { renderWithProviders } from "#/test/render";

const {
	routerState,
	routerInvalidateMock,
	routerNavigateMock,
	getArticlesMock,
	getTagsMock,
	createTagMock,
	deleteTagMock,
	updateTagMock,
} = vi.hoisted(() => ({
	routerState: {
		location: {
			pathname: "/app/favorites",
			search: {},
		},
	},
	routerInvalidateMock: vi.fn(),
	routerNavigateMock: vi.fn(),
	getArticlesMock: vi.fn(),
	getTagsMock: vi.fn(),
	createTagMock: vi.fn(),
	deleteTagMock: vi.fn(),
	updateTagMock: vi.fn(),
}));

vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);

	return {
		...actual,
		Link: ({
			children,
			to,
			className,
			...props
		}: React.ComponentProps<"a"> & {
			to: string;
			className?: string;
		}) => (
			<a href={to} className={className} {...props}>
				{children}
			</a>
		),
		useRouterState: () => routerState,
		useRouter: () => ({
			invalidate: routerInvalidateMock,
			navigate: routerNavigateMock,
		}),
	};
});

vi.mock("#/server/articles", () => ({
	getArticles: getArticlesMock,
}));

vi.mock("#/server/tags", () => ({
	createTag: createTagMock,
	deleteTag: deleteTagMock,
	getTags: getTagsMock,
	updateTag: updateTagMock,
}));

describe("AppSidebar", () => {
	beforeEach(() => {
		routerState.location.pathname = "/app/favorites";
		routerState.location.search = {};
		routerInvalidateMock.mockReset();
		routerNavigateMock.mockReset();
		getArticlesMock.mockReset().mockResolvedValue({ total: 3 });
		getTagsMock.mockReset().mockResolvedValue([]);
		createTagMock.mockReset().mockResolvedValue({
			id: "t3",
			name: "Testing",
			color: null,
		});
		deleteTagMock.mockReset().mockResolvedValue({});
		updateTagMock.mockReset().mockResolvedValue({});
	});

	it("renders the favorites navigation item as active", async () => {
		renderWithProviders(<AppSidebar />);

		const favoritesLink = await screen.findByRole("link", {
			name: /favorites/i,
		});
		expect(favoritesLink).toHaveAttribute("href", "/app/favorites");
		expect(favoritesLink.className).toContain("bg-sidebar-accent");
	});

	it("renders searchable tag navigation with rename and delete controls", async () => {
		const user = userEvent.setup();
		getTagsMock.mockResolvedValue([
			{ id: "t1", name: "Design", color: null, articleCount: 2 },
			{ id: "t2", name: "Research", color: null, articleCount: 1 },
		]);

		renderWithProviders(<AppSidebar />);

		expect(
			await screen.findByRole("link", { name: /design/i }),
		).toHaveAttribute("href", "/app/tags");
		expect(screen.getByRole("link", { name: /research/i })).toBeInTheDocument();

		await user.type(screen.getByLabelText("Filter tags"), "res");
		expect(
			screen.queryByRole("link", { name: /design/i }),
		).not.toBeInTheDocument();
		expect(screen.getByRole("link", { name: /research/i })).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: /rename research/i }));
		const input = screen.getByLabelText("Tag name");
		await user.clear(input);
		await user.type(input, "Knowledge");
		await user.click(screen.getByRole("button", { name: "Save" }));

		await screen.findByRole("link", { name: /research/i });
		expect(updateTagMock).toHaveBeenCalledWith({
			data: { id: "t2", name: "Knowledge" },
		});

		await user.click(screen.getByRole("button", { name: /delete research/i }));
		expect(deleteTagMock).toHaveBeenCalledWith({ data: { id: "t2" } });
	});
});
