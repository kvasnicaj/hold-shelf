import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent } from "storybook/test";
import { SavePage } from "#/components/save/save-page";

const meta = {
	title: "Pages/Save link",
	component: SavePage,
	args: { url: "https://example.com/new-article" },
	parameters: { layout: "fullscreen" },
	tags: ["!autodocs"],
} satisfies Meta<typeof SavePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Confirm: Story = {
	play: async ({ canvas }) => {
		await userEvent.click(canvas.getByRole("button", { name: "Save article" }));
		await expect(
			await canvas.findByRole("heading", { name: "All set" }),
		).toBeVisible();
		await expect(
			canvas.getByRole("link", { name: "Open Unread" }),
		).toBeVisible();
	},
};
export const MissingUrl: Story = { args: { url: undefined } };
export const DuplicateOnSave: Story = {
	parameters: { mockScenario: "duplicate" },
	play: async ({ canvas }) => {
		await userEvent.click(canvas.getByRole("button", { name: "Save article" }));
		await expect(
			await canvas.findByRole("heading", { name: "All set" }),
		).toBeVisible();
		await expect(canvas.getByText(/already in your library/i)).toBeVisible();
	},
};
export const FailureOnSave: Story = {
	parameters: { mockScenario: "error" },
	play: async ({ canvas }) => {
		await userEvent.click(canvas.getByRole("button", { name: "Save article" }));
		await expect(
			await canvas.findByRole("heading", { name: "We hit a snag" }),
		).toBeVisible();
		await expect(
			canvas.getByRole("button", { name: "Try saving again" }),
		).toBeEnabled();
	},
};
