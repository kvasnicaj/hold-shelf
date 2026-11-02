import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ShareTagDialog } from "#/components/tags/share-tag-dialog";
import { sampleShare } from "#/stories/fixtures";

const meta = {
	title: "Tags/Sharing dialog",
	component: ShareTagDialog,
	args: {
		tagId: "design",
		tagName: "Design",
		initialShare: null,
		onShareChange: fn(),
	},
	tags: ["!autodocs"],
} satisfies Meta<typeof ShareTagDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Private: Story = {};
export const Shared: Story = {
	args: { initialShare: sampleShare },
	parameters: { mockScenario: "token" },
};
export const Failure: Story = { parameters: { mockScenario: "error" } };
