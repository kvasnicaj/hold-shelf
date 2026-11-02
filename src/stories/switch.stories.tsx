import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Switch } from "#/components/ui/switch";

const meta = {
	title: "UI/Switch",
	component: Switch,
	args: { "aria-label": "Remember reading position", onCheckedChange: fn() },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {};
export const On: Story = { args: { defaultChecked: true } };
export const Disabled: Story = { args: { disabled: true } };
