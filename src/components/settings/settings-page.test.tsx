import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CHROME_EXTENSION_URL } from "#/components/home/helpers";
import { SettingsPage } from "#/components/settings/settings-page";
import { renderWithProviders } from "#/test/render";

const { routeState, routerInvalidateMock, updateUserSettingsMock } = vi.hoisted(
	() => ({
		routeState: {
			loaderData: {
				settings: {
					markReadOnOpen: true,
				},
			},
		},
		routerInvalidateMock: vi.fn(),
		updateUserSettingsMock: vi.fn(),
	}),
);

vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);

	return {
		...actual,
		getRouteApi: () => ({
			useLoaderData: () => routeState.loaderData,
		}),
		useRouter: () => ({
			invalidate: routerInvalidateMock,
		}),
	};
});

vi.mock("#/server/user-settings", () => ({
	updateUserSettings: updateUserSettingsMock,
}));

vi.mock("#/components/settings/account-summary-card", () => ({
	AccountSummaryCard: () => <div>Account summary</div>,
}));

vi.mock("#/components/settings/api-token-card", () => ({
	ApiTokenCard: () => <div>API access</div>,
}));

vi.mock("#/components/settings/delete-account-card", () => ({
	DeleteAccountCard: () => <div>Delete account</div>,
}));

vi.mock("#/components/theme-toggle", () => ({
	default: () => <button type="button">Theme toggle</button>,
}));

describe("SettingsPage", () => {
	beforeEach(() => {
		routeState.loaderData.settings.markReadOnOpen = true;
		routerInvalidateMock.mockReset().mockResolvedValue(undefined);
		updateUserSettingsMock.mockReset().mockResolvedValue({ success: true });
	});

	it("renders the reading preference from loader data", () => {
		renderWithProviders(<SettingsPage />);

		expect(
			screen.getByRole("heading", { name: "Settings" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("switch", {
				name: "Mark articles as read when opened",
			}),
		).toBeChecked();
		expect(
			screen.getByText(/opening an article from hold shelf marks it as read/i),
		).toBeInTheDocument();
		expect(screen.getByText("Browser extension")).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /add to chrome/i }),
		).toHaveAttribute("href", CHROME_EXTENSION_URL);
		expect(screen.getByText("API access")).toBeInTheDocument();
	});

	it("persists the reading preference toggle", async () => {
		const user = userEvent.setup();
		renderWithProviders(<SettingsPage />);

		await user.click(
			screen.getByRole("switch", {
				name: "Mark articles as read when opened",
			}),
		);

		await waitFor(() => {
			expect(updateUserSettingsMock).toHaveBeenCalledWith({
				data: { markReadOnOpen: false },
			});
		});
		expect(routerInvalidateMock).toHaveBeenCalled();
	});
});
