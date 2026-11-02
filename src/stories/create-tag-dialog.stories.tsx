import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { CreateTagDialog } from "#/components/tags/create-tag-dialog";

const meta = {
	title: "Tags/Create dialog",
	component: CreateTagDialog,
	args: { onCreate: fn(async () => {}) },
} satisfies Meta<typeof CreateTagDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvas, canvasElement, args }) => {
		const trigger = canvas.getByRole("button", { name: "Create tag" });
		await userEvent.click(trigger);
		const body = within(canvasElement.ownerDocument.body);
		const dialog = within(
			await body.findByRole("dialog", { name: "Create tag" }),
		);
		const input = dialog.getByRole("textbox", { name: "Name" });
		await userEvent.type(input, "  Research  ");
		await userEvent.click(
			dialog.getByRole("button", { name: "Create & add another" }),
		);
		await expect(args.onCreate).toHaveBeenCalledWith("Research");
		await waitFor(() => expect(input).toHaveValue(""));
		await expect(dialog.getByText("Research", { exact: true })).toBeVisible();
		await expect(input).toHaveFocus();
		await userEvent.type(input, "Weekend");
		await userEvent.click(dialog.getByRole("button", { name: "Create" }));
		await expect(args.onCreate).toHaveBeenCalledWith("Weekend");
		await waitFor(() =>
			expect(body.queryByRole("dialog")).not.toBeInTheDocument(),
		);
		await waitFor(() => expect(trigger).toHaveFocus());
	},
};
export const ErrorOnCreate: Story = {
	args: {
		onCreate: fn(async () => {
			throw new Error("A tag with this name already exists.");
		}),
	},
	play: async ({ canvas, canvasElement }) => {
		await userEvent.click(canvas.getByRole("button", { name: "Create tag" }));
		const dialog = within(
			await within(canvasElement.ownerDocument.body).findByRole("dialog", {
				name: "Create tag",
			}),
		);
		const input = dialog.getByRole("textbox", { name: "Name" });
		await userEvent.type(input, "Design");
		await userEvent.click(dialog.getByRole("button", { name: "Create" }));
		await expect(await dialog.findByText("Failed to create tag")).toBeVisible();
		await expect(input).toHaveValue("Design");
		await expect(input).toHaveAttribute("aria-invalid", "true");
		await expect(dialog.getByRole("button", { name: "Create" })).toBeEnabled();
	},
};
