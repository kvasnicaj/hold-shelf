import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { TagHeadingActions } from "#/components/tags/tag-heading-actions";
import { sampleShare } from "#/stories/fixtures";

const meta = {
	title: "Tags/Heading actions",
	component: TagHeadingActions,
	args: {
		tagId: "design",
		tagName: "Design",
		initialShare: null,
		onRename: fn(async () => {}),
		onDelete: fn(async () => {}),
	},
} satisfies Meta<typeof TagHeadingActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Private: Story = {};
export const Shared: Story = {
	args: { initialShare: sampleShare },
	parameters: { mockScenario: "token" },
};
export const WithBack: Story = { args: { showBack: true, onBack: fn() } };
