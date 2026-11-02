import type { Meta, StoryObj } from "@storybook/react-vite";
import { SidebarTagsSection } from "#/components/layout/sidebar-tags-section";

import { sampleTags } from "#/stories/fixtures";

const meta = {
	title: "Layout/Sidebar tags",
	component: SidebarTagsSection,
	args: { tags: sampleTags, currentPath: "/app/tags", activeTagId: "design" },
	decorators: [
		(Story) => (
			<div className="flex h-96 w-56 flex-col bg-sidebar pl-3">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof SidebarTagsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Populated: Story = {};
export const Empty: Story = { args: { tags: [] } };
