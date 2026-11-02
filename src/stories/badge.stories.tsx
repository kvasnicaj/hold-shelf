import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "#/components/ui/badge";

const meta = {
	title: "UI/Badge",
	component: Badge,
	args: { children: "Design", variant: "secondary" },
	argTypes: {
		variant: {
			control: "select",
			options: [
				"default",
				"secondary",
				"outline",
				"destructive",
				"ghost",
				"link",
			],
		},
	},
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Secondary: Story = {};
export const Primary: Story = {
	args: { variant: "default", children: "Unread" },
};
export const Outline: Story = { args: { variant: "outline" } };
export const Destructive: Story = {
	args: { variant: "destructive", children: "Unavailable" },
};
export const Ghost: Story = { args: { variant: "ghost" } };
export const Link: Story = { args: { variant: "link" } };
