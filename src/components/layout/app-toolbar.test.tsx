import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppToolbar } from "#/components/layout/app-toolbar";
import { renderWithProviders } from "#/test/render";

const { navigateMock, routerState, signOutMock, useSessionMock } = vi.hoisted(
	() => ({
		navigateMock: vi.fn(),
		routerState: {
			location: {
				pathname: "/app/articles",
			},
		},
		signOutMock: vi.fn(),
		useSessionMock: vi.fn(),
	}),
);

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
		useRouter: () => ({
			navigate: navigateMock,
		}),
		useRouterState: () => routerState,
	};
});

vi.mock("#/components/theme-toggle", () => ({
	default: ({ size }: { size?: string }) => (
		<button type="button">ThemeToggle:{size}</button>
	),
}));

vi.mock("#/components/ui/dropdown-menu", () => ({
	DropdownMenu: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
		<>{children}</>
	),
	DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	DropdownMenuItem: ({
		children,
		onClick,
	}: {
		children: React.ReactNode;
		onClick?: () => void | Promise<void>;
	}) => (
		<button type="button" role="menuitem" onClick={onClick}>
			{children}
		</button>
	),
}));

vi.mock("#/lib/auth-client", () => ({
	authClient: {
		useSession: useSessionMock,
		signOut: signOutMock,
	},
}));

describe("AppToolbar", () => {
	beforeEach(() => {
		navigateMock.mockReset();
		signOutMock.mockReset().mockResolvedValue(undefined);
		useSessionMock.mockReset().mockReturnValue({
			data: {
				user: {
					name: "Jaroslav",
					email: "jaroslav@example.com",
				},
			},
		});
		routerState.location.pathname = "/app/articles";
	});

	it("shows search controls, syncs external search state, and highlights settings", async () => {
		const user = userEvent.setup();
		const onSearch = vi.fn();
		routerState.location.pathname = "/app/settings";

		const { rerender } = renderWithProviders(
			<AppToolbar
				actions={<button type="button">Bulk actions</button>}
				searchValue="design"
				searchPlaceholder="Search articles"
				onSearch={onSearch}
			/>,
		);

		const input = screen.getByPlaceholderText("Search articles");
		expect(input).toHaveValue("design");
		expect(
			screen.getByRole("button", { name: "Bulk actions" }),
		).toBeInTheDocument();
		expect(screen.getByText("Jaroslav")).toBeInTheDocument();

		await user.clear(input);
		await user.type(input, "zustand");
		expect(onSearch).toHaveBeenLastCalledWith("zustand");

		rerender(
			<AppToolbar
				actions={<button type="button">Bulk actions</button>}
				searchValue="fresh query"
				searchPlaceholder="Search articles"
				onSearch={onSearch}
			/>,
		);

		expect(screen.getByPlaceholderText("Search articles")).toHaveValue(
			"fresh query",
		);

		const settingsLink = document.querySelector('a[href="/app/settings"]');
		expect(settingsLink?.className).toContain("bg-accent");
	});

	it("signs the user out and navigates back to login", async () => {
		const user = userEvent.setup();

		renderWithProviders(<AppToolbar />);

		await user.click(screen.getByRole("menuitem", { name: /sign out/i }));

		expect(signOutMock).toHaveBeenCalledOnce();
		expect(navigateMock).toHaveBeenCalledWith({ to: "/login" });
	});
});
