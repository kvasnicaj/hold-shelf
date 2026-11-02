import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { TagsListView } from "#/components/tags/tags-list-view";
import { sampleTags } from "#/stories/fixtures";

const meta = {
	title: "Tags/List",
	component: TagsListView,
	args: {
		filteredTags: sampleTags,
		filter: "",
		onSelectTag: fn(),
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
} satisfies Meta<typeof TagsListView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Populated: Story = {};
export const Selected: Story = { args: { activeTagId: "design" } };
export const Empty: Story = { args: { filteredTags: [] } };
export const NoMatches: Story = {
	args: { filteredTags: [], filter: "missing" },
};
