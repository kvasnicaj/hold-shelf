import type { Meta, StoryObj } from "@storybook/react-vite";
import { UserAvatar } from "#/components/layout/user-avatar";

const meta = {
	title: "Layout/Avatar",
	component: UserAvatar,
	args: { name: "Alex Reader" },
} satisfies Meta<typeof UserAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initial: Story = {};
export const MissingName: Story = { args: { name: null } };
export const Image: Story = { args: { image: "/logo192.png" } };
export const BrokenImage: Story = {
	args: { image: "data:image/png;base64,invalid" },
};
export const Large: Story = { args: { className: "size-12 text-lg" } };
