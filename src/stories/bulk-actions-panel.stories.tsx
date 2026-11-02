import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { BulkActionsPanel } from "#/components/articles/bulk-actions-panel";

const meta = {
	title: "Articles/Bulk actions",
	component: BulkActionsPanel,
	args: {
		count: 3,
		onMarkRead: fn(),
		onMarkUnread: fn(),
		onDelete: fn(),
		onClear: fn(),
	},
	parameters: {
		layout: "fullscreen",
		docs: { story: { inline: false, height: "300px" } },
	},
} satisfies Meta<typeof BulkActionsPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Multiple: Story = {};
export const Single: Story = { args: { count: 1 } };
export const Phone: Story = {
	globals: { viewport: { value: "phone", isRotated: false } },
};
