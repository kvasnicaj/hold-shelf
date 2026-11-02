import type { Meta, StoryObj } from "@storybook/react-vite";
import { TagLabel } from "#/components/tags/tag-label";

const meta = {
	title: "Tags/Label",
	component: TagLabel,
	args: { name: "Design" },
} satisfies Meta<typeof TagLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const LongName: Story = {
	args: { name: "A longer reading category with several words" },
};
