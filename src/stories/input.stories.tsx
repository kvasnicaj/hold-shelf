import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "#/components/ui/input";

const meta = {
	title: "UI/Input",
	component: Input,
	args: {
		type: "url",
		placeholder: "Paste a link to save",
		"aria-label": "Article URL",
		className: "w-80 max-w-full",
	},
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const Filled: Story = {
	args: { defaultValue: "https://example.com/article" },
};
export const Invalid: Story = {
	args: { "aria-invalid": true, defaultValue: "not a link" },
};
export const Disabled: Story = { args: { disabled: true } };
