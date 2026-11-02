import { Plus } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Button } from "#/components/ui/button";

const meta = {
	title: "UI/Button",
	component: Button,
	args: { children: "Save a link", onClick: fn() },
	argTypes: {
		variant: {
			control: "select",
			options: [
				"default",
				"secondary",
				"outline",
				"ghost",
				"link",
				"destructive",
				"destructive-outline",
			],
		},
		size: {
			control: "select",
			options: [
				"default",
				"xs",
				"sm",
				"lg",
				"icon",
				"icon-xs",
				"icon-sm",
				"icon-touch",
				"icon-lg",
			],
		},
	},
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: "secondary" } };
export const Outline: Story = { args: { variant: "outline" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Link: Story = {
	args: { variant: "link", children: "Open original" },
};
export const Destructive: Story = {
	args: { variant: "destructive", children: "Delete forever" },
};
export const Sizes: Story = {
	render: (args) => (
		<div className="flex flex-wrap items-center gap-3">
			{(["xs", "sm", "default", "lg"] as const).map((size) => (
				<Button {...args} key={size} size={size}>
					{size}
				</Button>
			))}
		</div>
	),
};
export const DeleteForever: Story = {
	args: { variant: "destructive-outline", children: "Delete forever" },
};
export const Disabled: Story = { args: { disabled: true } };
export const WithIcon: Story = {
	args: {
		children: (
			<>
				<Plus />
				Save a link
			</>
		),
	},
};
export const IconTouch: Story = {
	args: { size: "icon-touch", "aria-label": "Save a link", children: <Plus /> },
};
