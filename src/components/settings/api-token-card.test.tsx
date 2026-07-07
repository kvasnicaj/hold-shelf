import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiTokenCard } from "#/components/settings/api-token-card";
import { renderWithProviders } from "#/test/render";

const { hookState, handleCopyMock, handleGenerateMock, handleRevokeMock } =
	vi.hoisted(() => ({
		hookState: {
			apiToken: null as {
				tokenPrefix: string;
				createdAt: Date;
				lastUsedAt: Date | null;
			} | null,
			newToken: null as string | null,
			loading: false,
			copying: false,
			error: null as string | null,
		},
		handleCopyMock: vi.fn(),
		handleGenerateMock: vi.fn(),
		handleRevokeMock: vi.fn(),
	}));

vi.mock("#/components/settings/use-api-token-card", () => ({
	useApiTokenCard: () => ({
		...hookState,
		handleCopy: handleCopyMock,
		handleGenerate: handleGenerateMock,
		handleRevoke: handleRevokeMock,
	}),
}));

describe("ApiTokenCard", () => {
	beforeEach(() => {
		hookState.apiToken = null;
		hookState.newToken = null;
		hookState.loading = false;
		hookState.copying = false;
		hookState.error = null;
		handleCopyMock.mockReset().mockResolvedValue(undefined);
		handleGenerateMock.mockReset().mockResolvedValue(undefined);
		handleRevokeMock.mockReset().mockResolvedValue(undefined);
	});

	it("renders the empty state and generates a token", async () => {
		const user = userEvent.setup();
		renderWithProviders(<ApiTokenCard />);

		expect(screen.getByText("No personal token")).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /read api docs/i }),
		).toHaveAttribute("href", "/api-docs");

		await user.click(screen.getByRole("button", { name: /generate token/i }));

		expect(handleGenerateMock).toHaveBeenCalled();
	});

	it("renders token metadata and revoke action", async () => {
		const user = userEvent.setup();
		hookState.apiToken = {
			tokenPrefix: "hs_abc123456",
			createdAt: new Date("2026-05-13T10:00:00.000Z"),
			lastUsedAt: null,
		};

		renderWithProviders(<ApiTokenCard />);

		expect(screen.getByText("Personal token enabled")).toBeInTheDocument();
		expect(screen.getByText(/hs_abc123456/)).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: /revoke/i }));

		expect(handleRevokeMock).toHaveBeenCalled();
	});

	it("shows a newly generated token and copies it", async () => {
		const user = userEvent.setup();
		hookState.apiToken = {
			tokenPrefix: "hs_abc123456",
			createdAt: new Date("2026-05-13T10:00:00.000Z"),
			lastUsedAt: null,
		};
		hookState.newToken = "hs_abc123456secret";

		renderWithProviders(<ApiTokenCard />);

		expect(screen.getByDisplayValue("hs_abc123456secret")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: /copy api token/i }));

		expect(handleCopyMock).toHaveBeenCalled();
	});
});
