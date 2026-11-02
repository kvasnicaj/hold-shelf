import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ReaderCloseButton } from "#/components/article-reader/reader-close-button";

const meta = {
	title: "Reader/Close button",
	component: ReaderCloseButton,
	args: { onClick: fn() },
} satisfies Meta<typeof ReaderCloseButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
