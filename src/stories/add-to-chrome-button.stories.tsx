import type { Meta, StoryObj } from "@storybook/react-vite";
import { AddToChromeButton } from "#/components/extension/add-to-chrome-button";

const meta = {
	title: "Public/Add to Chrome",
	component: AddToChromeButton,
} satisfies Meta<typeof AddToChromeButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Outline: Story = {};
export const Primary: Story = { args: { variant: "default" } };
export const Large: Story = { args: { size: "lg" } };
