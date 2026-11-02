import type { Meta, StoryObj } from "@storybook/react-vite";
import { CreatedTagsList } from "#/components/tags/created-tags-list";

const meta = {
	title: "Tags/Created tags",
	component: CreatedTagsList,
	args: { created: ["Design", "Engineering", "Weekend reads"] },
} satisfies Meta<typeof CreatedTagsList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Several: Story = {};
export const Single: Story = { args: { created: ["Design"] } };
export const Empty: Story = { args: { created: [] } };
