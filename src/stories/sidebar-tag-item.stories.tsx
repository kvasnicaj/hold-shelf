import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { SidebarTagItem } from "#/components/layout/sidebar-tag-item";
import { sampleTags } from "#/stories/fixtures";

const meta = {
	title: "Layout/Sidebar tag",
	component: SidebarTagItem,
	args: {
		tag: sampleTags[0],
		isActive: false,
		onRename: fn(async () => {}),
		onDelete: fn(async () => {}),
	},
	decorators: [
		(Story) => (
			<div className="w-56 bg-sidebar p-2">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof SidebarTagItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Active: Story = { args: { isActive: true } };
export const LongName: Story = {
	args: {
		tag: {
			...sampleTags[0],
			name: "Notes on reading and designing thoughtful software",
		},
	},
};
