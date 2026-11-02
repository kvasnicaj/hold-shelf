import type { Meta, StoryObj } from "@storybook/react-vite";
import { DesktopSidebarShell } from "#/components/ui/desktop-sidebar-shell";
import { SidebarInset, SidebarProvider } from "#/components/ui/sidebar";
import { StorySidebarContent } from "#/stories/story-sidebar-content";

const meta = {
	title: "UI/Desktop Sidebar Shell",
	component: DesktopSidebarShell,
	args: {
		side: "left",
		variant: "sidebar",
		collapsible: "icon",
		state: "expanded",
		children: <StorySidebarContent />,
	},
	parameters: { layout: "fullscreen" },
	tags: ["!autodocs"],
	decorators: [
		(Story) => (
			<SidebarProvider>
				<Story />
				<SidebarInset>
					<p className="p-8 text-sm">Desktop sidebar content</p>
				</SidebarInset>
			</SidebarProvider>
		),
	],
} satisfies Meta<typeof DesktopSidebarShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Expanded: Story = {};
export const Collapsed: Story = { args: { state: "collapsed" } };
export const Floating: Story = { args: { variant: "floating" } };
