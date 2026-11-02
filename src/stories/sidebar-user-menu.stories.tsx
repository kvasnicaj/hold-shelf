import type { Meta, StoryObj } from "@storybook/react-vite";
import { SidebarUserMenu } from "#/components/layout/sidebar-user-menu";

const meta = {
	title: "Layout/Sidebar account menu",
	component: SidebarUserMenu,
	tags: ["!autodocs"],
	decorators: [
		(Story) => (
			<div className="w-56 bg-sidebar p-2">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof SidebarUserMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedIn: Story = {};
export const SignedOut: Story = { parameters: { mockScenario: "signed-out" } };
