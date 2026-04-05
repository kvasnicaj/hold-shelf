import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CreateTagDialog } from "#/components/tags/create-tag-dialog";
import { renderWithProviders } from "#/test/render";

describe("CreateTagDialog", () => {
	it("validates required input and creates a tag", async () => {
		const user = userEvent.setup();
		const onCreate = vi.fn().mockResolvedValue(undefined);
		renderWithProviders(<CreateTagDialog onCreate={onCreate} />);

		await user.click(screen.getByRole("button", { name: /create tag/i }));
		await user.click(screen.getByRole("button", { name: /^create$/i }));

		expect(screen.getByText("Tag name is required")).toBeInTheDocument();

		await user.type(screen.getByLabelText("Name"), "Research");
		await user.click(screen.getByRole("button", { name: /^create$/i }));

		await waitFor(() => expect(onCreate).toHaveBeenCalledWith("Research"));
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
	});

	it("supports create-and-add-another and resets state when the dialog closes", async () => {
		const user = userEvent.setup();
		const onCreate = vi.fn().mockResolvedValue(undefined);
		renderWithProviders(<CreateTagDialog onCreate={onCreate} />);

		await user.click(screen.getByRole("button", { name: /create tag/i }));
		await user.type(screen.getByLabelText("Name"), "Design");
		await user.click(
			screen.getByRole("button", { name: /create & add another/i }),
		);

		await waitFor(() => expect(onCreate).toHaveBeenCalledWith("Design"));
		expect(screen.getByText("Design")).toBeInTheDocument();
		expect(screen.getByLabelText("Name")).toHaveValue("");

		const dialog = screen.getByRole("dialog");
		await user.click(within(dialog).getByRole("button", { name: /close/i }));
		await user.click(screen.getByRole("button", { name: /create tag/i }));

		expect(screen.getByLabelText("Name")).toHaveValue("");
		expect(screen.queryByText("Design")).not.toBeInTheDocument();
	});
});
