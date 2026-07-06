import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BulkActionsPanel } from "#/components/articles/bulk-actions-panel";
import { renderWithProviders } from "#/test/render";

describe("BulkActionsPanel", () => {
	it("renders expanded inline actions for wider layouts", async () => {
		const user = userEvent.setup();
		const onMarkRead = vi.fn();

		renderWithProviders(
			<BulkActionsPanel
				count={2}
				onMarkRead={onMarkRead}
				onMarkUnread={vi.fn()}
				onDelete={vi.fn()}
				onClear={vi.fn()}
			/>,
		);

		expect(screen.getByText("2 selected")).toBeInTheDocument();

		await user.click(screen.getByTitle("Mark read"));

		expect(onMarkRead).toHaveBeenCalledTimes(1);
	});

	it("opens the collapsed bulk actions menu from the icon trigger", async () => {
		const user = userEvent.setup();
		const onMarkRead = vi.fn();

		renderWithProviders(
			<BulkActionsPanel
				count={2}
				onMarkRead={onMarkRead}
				onMarkUnread={vi.fn()}
				onDelete={vi.fn()}
				onClear={vi.fn()}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /bulk actions/i }));
		await user.click(
			await screen.findByRole("menuitem", { name: /mark read/i }),
		);

		expect(onMarkRead).toHaveBeenCalledTimes(1);
	});
});
