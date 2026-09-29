import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { TrashPage } from "#/components/library/trash-page";
import { getTrash, permanentlyDeleteTrash } from "#/server/library";
import { renderWithProviders } from "#/test/render";

vi.mock("@tanstack/react-router", () => ({
	useRouter: () => ({ invalidate: vi.fn() }),
}));

it("requires confirmation, supports cancel, and preserves the dialog after a failed deletion", async () => {
	const user = userEvent.setup();
	vi.mocked(getTrash).mockResolvedValue([
		{
			id: "a1",
			title: "Saved article",
			url: "https://example.com",
			deletedAt: new Date(),
		},
	]);
	vi.mocked(permanentlyDeleteTrash)
		.mockRejectedValueOnce(new Error("Network failed"))
		.mockResolvedValue({ success: true });
	renderWithProviders(<TrashPage />);
	await user.click(
		await screen.findByRole("button", {
			name: "Permanently delete Saved article",
		}),
	);
	const dialog = screen.getByRole("dialog");
	expect(within(dialog).getByRole("button", { name: "Cancel" })).toHaveFocus();
	expect(permanentlyDeleteTrash).not.toHaveBeenCalled();
	await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
	expect(permanentlyDeleteTrash).not.toHaveBeenCalled();
	await user.click(screen.getByRole("button", { name: "Empty Trash" }));
	await user.click(
		within(screen.getByRole("dialog")).getByRole("button", {
			name: "Empty Trash",
		}),
	);
	expect(await screen.findByRole("alert")).toHaveTextContent(
		"Could not delete",
	);
	await user.click(
		within(screen.getByRole("dialog")).getByRole("button", {
			name: "Empty Trash",
		}),
	);
	await waitFor(() =>
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
	);
	expect(permanentlyDeleteTrash).toHaveBeenLastCalledWith({
		data: { mode: "all" },
	});
});
