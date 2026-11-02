import type { Meta, StoryObj } from "@storybook/react-vite";
import { SaveLinkAction } from "#/components/layout/save-link-action";
import { Button } from "#/components/ui/button";

const meta = {
	title: "Layout/Save link action",
	component: SaveLinkAction,
	args: { children: <Button>Save a link</Button> },
} satisfies Meta<typeof SaveLinkAction>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
