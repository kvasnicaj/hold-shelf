import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AccountSummaryCard } from "#/components/settings/account-summary-card";
import { renderWithProviders } from "#/test/render";

const { useSessionMock } = vi.hoisted(() => ({
	useSessionMock: vi.fn(),
}));

vi.mock("#/lib/auth-client", () => ({
	authClient: {
		useSession: useSessionMock,
	},
}));

describe("AccountSummaryCard", () => {
	it("renders the current GitHub-backed account details", () => {
		useSessionMock.mockReturnValue({
			data: {
				user: {
					name: "Jaroslav",
					email: "jaroslav@example.com",
					image: "https://example.com/avatar.png",
				},
			},
		});

		renderWithProviders(<AccountSummaryCard />);

		expect(screen.getByText("Account")).toBeInTheDocument();
		expect(screen.getByText("Jaroslav")).toBeInTheDocument();
		expect(screen.getByText("jaroslav@example.com")).toBeInTheDocument();
		expect(screen.getByText("GitHub")).toBeInTheDocument();
		expect(
			screen.getByText(/github is the only sign-in method for this account/i),
		).toBeInTheDocument();
	});

	it("falls back gracefully when the session has not loaded yet", () => {
		useSessionMock.mockReturnValue({ data: null });

		renderWithProviders(<AccountSummaryCard />);

		expect(screen.getByText("GitHub account")).toBeInTheDocument();
		expect(screen.getByText("Signed in with GitHub")).toBeInTheDocument();
	});
});
