import { BookOpen } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MobileNavTabContent } from "#/components/layout/mobile-nav-tab-content";

const meta = {
	title: "Layout/Mobile tab",
	component: MobileNavTabContent,
	args: { icon: BookOpen, label: "Unread" },
	decorators: [
		(Story) => (
			<div className="flex w-20 flex-col items-center gap-1 text-xs">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof MobileNavTabContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Active: Story = { args: { isActive: true, badge: 12 } };
export const Primary: Story = { args: { primary: true, label: "Save" } };
