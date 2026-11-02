import type { Meta, StoryObj } from "@storybook/react-vite";
import {
	Sidebar,
	SidebarInset,
	SidebarProvider,
	SidebarRail,
	SidebarTrigger,
} from "#/components/ui/sidebar";
import { StorySidebarContent } from "#/stories/story-sidebar-content";

const meta = {
	title: "UI/Sidebar",
	component: Sidebar,
	args: { collapsible: "icon" },
	parameters: { layout: "fullscreen" },
	tags: ["!autodocs"],
	render: (args) => (
		<SidebarProvider>
			<Sidebar {...args}>
				<StorySidebarContent />
				<SidebarRail />
			</Sidebar>
			<SidebarInset>
				<div className="flex items-center gap-3 border-b p-4">
					<SidebarTrigger />
					<span className="text-sm">Your library</span>
				</div>
				<p className="p-6 text-sm text-muted-foreground">
					Use the toggle to collapse or expand the sidebar.
				</p>
			</SidebarInset>
		</SidebarProvider>
	),
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Expanded: Story = {};
export const Floating: Story = { args: { variant: "floating" } };
export const Inset: Story = { args: { variant: "inset" } };
export const Right: Story = { args: { side: "right" } };
export const Static: Story = { args: { collapsible: "none" } };
export const Loading: Story = {
	render: (args) => (
		<SidebarProvider>
			<Sidebar {...args}>
				<StorySidebarContent loading />
			</Sidebar>
			<SidebarInset>
				<SidebarTrigger />
			</SidebarInset>
		</SidebarProvider>
	),
};
export const Phone: Story = {
	globals: { viewport: { value: "phone", isRotated: false } },
};
