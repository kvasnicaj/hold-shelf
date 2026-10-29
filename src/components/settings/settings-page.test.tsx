import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SettingsPage } from "#/components/settings/settings-page";
import { renderWithProviders } from "#/test/render";

vi.mock("#/components/library/library-backup-card", () => ({
	LibraryBackupCard: () => <div>Library backup</div>,
}));

vi.mock("#/components/settings/account-summary-card", () => ({
	AccountSummaryCard: () => <div>Account summary</div>,
}));

vi.mock("#/components/settings/api-token-card", () => ({
	ApiTokenCard: () => <div>API access</div>,
}));

vi.mock("#/components/settings/cli-card", () => ({
	CliCard: () => <div>Command line</div>,
}));

vi.mock("#/components/settings/delete-account-card", () => ({
	DeleteAccountCard: () => <div>Delete account</div>,
}));

vi.mock("#/components/theme-toggle", () => ({
	default: () => <button type="button">Theme toggle</button>,
}));

describe("SettingsPage", () => {
	it("lists settings in one column, from everyday options to account removal", () => {
		const { container } = renderWithProviders(<SettingsPage />);

		expect(
			screen.getByRole("heading", { name: "Settings" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Theme toggle" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /add to chrome/i }),
		).toBeInTheDocument();
		expect(screen.queryByRole("switch")).not.toBeInTheDocument();

		const text = container.textContent ?? "";
		const order = [
			"Appearance",
			"Browser extension",
			"Library backup",
			"Account summary",
			"API access",
			"Command line",
			"Delete account",
		].map((label) => text.indexOf(label));
		expect(order.every((position) => position >= 0)).toBe(true);
		expect([...order].sort((a, b) => a - b)).toEqual(order);
	});
});
