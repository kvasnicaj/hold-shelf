import type { Meta, StoryObj } from "@storybook/react-vite";
import { SidebarProvider } from "#/components/ui/sidebar";
import { StaticSidebar } from "#/components/ui/static-sidebar";
import { StorySidebarContent } from "#/stories/story-sidebar-content";

const meta = {
	title: "UI/Static Sidebar",
	component: StaticSidebar,
	args: { children: <StorySidebarContent /> },
	parameters: { layout: "fullscreen" },
	tags: ["!autodocs"],
	decorators: [
		(Story) => (
			<SidebarProvider className="min-h-96">
				<Story />
			</SidebarProvider>
		),
	],
} satisfies Meta<typeof StaticSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
