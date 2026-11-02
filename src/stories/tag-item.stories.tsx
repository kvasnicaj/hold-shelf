import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { TagItem } from "#/components/tags/tag-item";
import { sampleTags } from "#/stories/fixtures";

const meta = {
	title: "Tags/List item",
	component: TagItem,
	args: {
		tag: sampleTags[0],
		isActive: false,
		onSelect: fn(),
		onRename: fn(async () => {}),
		onDelete: fn(async () => {}),
	},
	decorators: [
		(Story) => (
			<div className="w-[min(24rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof TagItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Active: Story = { args: { isActive: true } };
export const EmptyTag: Story = {
	args: { tag: { ...sampleTags[0], articleCount: 0 } },
};
