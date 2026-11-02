import { BookOpen } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { NavLink } from "#/components/layout/nav-link";

const meta = {
	title: "Layout/Navigation link",
	component: NavLink,
	args: {
		href: "/app/articles",
		icon: BookOpen,
		label: "Unread",
		isActive: false,
		badge: 12,
		shortcutKey: "u",
	},
	decorators: [
		(Story) => (
			<div className="w-56 bg-sidebar p-2">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof NavLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Active: Story = { args: { isActive: true } };
export const WithoutCount: Story = { args: { badge: undefined } };
