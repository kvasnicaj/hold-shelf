import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Button } from "#/components/ui/button";
import { MobileSidebarSheet } from "#/components/ui/mobile-sidebar-sheet";
import { SidebarProvider } from "#/components/ui/sidebar";
import { StorySidebarContent } from "#/stories/story-sidebar-content";
import { useStoryState } from "#/stories/use-story-state";

const meta = {
	title: "UI/Mobile Sidebar Sheet",
	component: MobileSidebarSheet,
	args: {
		side: "left",
		open: true,
		onOpenChange: fn(),
		children: <StorySidebarContent />,
	},
	parameters: { layout: "fullscreen" },
	tags: ["!autodocs"],
	render: function Render(initialArgs) {
		const [args, updateArgs] = useStoryState(initialArgs);
		return (
			<SidebarProvider>
				<Button onClick={() => updateArgs({ open: true })}>Open sidebar</Button>
				<MobileSidebarSheet
					{...args}
					onOpenChange={(open) => {
						args.onOpenChange?.(open);
						updateArgs({ open });
					}}
				/>
			</SidebarProvider>
		);
	},
} satisfies Meta<typeof MobileSidebarSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Left: Story = {};
export const Right: Story = { args: { side: "right" } };
