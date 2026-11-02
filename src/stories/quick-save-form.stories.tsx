import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { QuickSaveForm } from "#/components/quick-save/quick-save-form";
import { sampleTags } from "#/stories/fixtures";

const meta = {
	title: "Save/Form",
	component: QuickSaveForm,
	args: { tags: sampleTags, onSubmit: fn(async () => {}) },
	decorators: [
		(Story) => (
			<div className="w-[min(36rem,calc(100vw-2rem))] rounded-xl border bg-card p-5">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof QuickSaveForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
	play: async ({ canvas, args }) => {
		await userEvent.click(canvas.getByRole("button", { name: "Save" }));
		await expect(canvas.getByLabelText("Link")).toHaveAttribute(
			"aria-invalid",
			"true",
		);
		await expect(canvas.getByText("Paste a link to save it.")).toBeVisible();
		await expect(args.onSubmit).not.toHaveBeenCalled();
	},
};
export const ValidLink: Story = {
	args: { initialUrl: "https://example.com/new-article" },
	play: async ({ canvas, canvasElement, args }) => {
		await userEvent.click(canvas.getByRole("button", { name: "Choose tags" }));
		const picker = within(
			await within(canvasElement.ownerDocument.body).findByRole("dialog", {
				name: "Tags for this link",
			}),
		);
		await userEvent.click(picker.getByRole("checkbox", { name: "Design" }));
		await userEvent.click(picker.getByRole("button", { name: "Done" }));
		await expect(
			canvas.getByRole("button", { name: "Remove Design" }),
		).toBeVisible();
		await userEvent.click(canvas.getByRole("button", { name: "Save" }));
		await expect(args.onSubmit).toHaveBeenCalledWith(
			"https://example.com/new-article",
			["design"],
			"save",
		);
	},
};
export const InvalidLink: Story = {
	args: { initialUrl: "this is not a link" },
	play: async ({ canvas, args }) => {
		await userEvent.click(canvas.getByRole("button", { name: "Save" }));
		await expect(
			canvas.getByText(
				"That doesn't look like a link yet. Links start with https://",
			),
		).toBeVisible();
		await expect(args.onSubmit).not.toHaveBeenCalled();
	},
};
export const KeyboardSaveAndRead: Story = {
	play: async ({ canvas, args }) => {
		await userEvent.type(
			canvas.getByLabelText("Link"),
			"https://example.com/keyboard",
		);
		await userEvent.keyboard("{Shift>}{Enter}{/Shift}");
		await expect(args.onSubmit).toHaveBeenCalledWith(
			"https://example.com/keyboard",
			[],
			"read",
		);
	},
};
export const NoTags: Story = { args: { tags: [] } };
export const PhoneSheet: Story = {
	args: { variant: "sheet" },
	globals: { viewport: { value: "phone", isRotated: false } },
};
export const FailureOnSave: Story = {
	args: {
		initialUrl: "https://example.com/new-article",
		onSubmit: fn(async () => {
			throw new Error("The link could not be saved. Please try again.");
		}),
	},
	play: async ({ canvas }) => {
		await userEvent.click(canvas.getByRole("button", { name: "Save" }));
		await expect(
			await canvas.findByText("The link could not be saved. Please try again."),
		).toBeVisible();
		await expect(canvas.getByLabelText("Link")).toHaveValue(
			"https://example.com/new-article",
		);
		await expect(canvas.getByRole("button", { name: "Save" })).toBeEnabled();
	},
};
