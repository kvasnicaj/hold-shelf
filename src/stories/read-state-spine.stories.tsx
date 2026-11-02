import type { Meta, StoryObj } from "@storybook/react-vite";
import { ReadStateSpine } from "#/components/articles/read-state-spine";

const meta = {
	title: "Articles/Read state spine",
	component: ReadStateSpine,
	args: { isRead: false },
} satisfies Meta<typeof ReadStateSpine>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unread: Story = {};
export const Read: Story = { args: { isRead: true } };
