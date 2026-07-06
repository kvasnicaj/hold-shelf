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

	it("shows the compact account menu", () => {
		renderWithProviders(<AppToolbar />);

		expect(screen.getByText("Jaroslav")).toBeInTheDocument();
	});

	it("signs the user out and navigates back to login", async () => {
		const user = userEvent.setup();

		renderWithProviders(<AppToolbar />);

		await user.click(screen.getByRole("menuitem", { name: /sign out/i }));

		expect(signOutMock).toHaveBeenCalledOnce();
		expect(navigateMock).toHaveBeenCalledWith({ to: "/login" });
	});
});
