import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BulkActionsPanel } from "#/components/articles/bulk-actions-panel";
import { renderWithProviders } from "#/test/render";

describe("BulkActionsPanel", () => {
	it("runs bulk actions from the toolbar", async () => {
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

	it("floats as a labelled toolbar with a clear action", async () => {
		const user = userEvent.setup();
		const onClear = vi.fn();

		renderWithProviders(
			<BulkActionsPanel
				count={3}
				onMarkRead={vi.fn()}
				onMarkUnread={vi.fn()}
				onDelete={vi.fn()}
				onClear={onClear}
			/>,
		);

		const toolbar = screen.getByRole("toolbar", { name: "Bulk actions" });
		expect(toolbar).toHaveTextContent("3 selected");
		await user.click(screen.getByRole("button", { name: "Clear selection" }));

		expect(onClear).toHaveBeenCalledTimes(1);
	});
});
