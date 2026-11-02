import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { RenameTagDialog } from "#/components/tags/rename-tag-dialog";

const meta = {
	title: "Tags/Rename dialog",
	component: RenameTagDialog,
	args: { tagName: "Design", onRename: fn(async () => {}) },
} satisfies Meta<typeof RenameTagDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const ErrorOnRename: Story = {
	args: {
		onRename: fn(async () => {
			throw new Error("The tag could not be renamed.");
		}),
	},
};
