import type { Meta, StoryObj } from "@storybook/react-vite";
import { AppBrandMark } from "#/components/layout/app-brand-mark";

const meta = {
	title: "Layout/Mobile brand mark",
	component: AppBrandMark,
	parameters: { layout: "fullscreen", routePath: "/app/articles" },
	tags: ["!autodocs"],
} satisfies Meta<typeof AppBrandMark>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Phone: Story = {
	globals: { viewport: { value: "phone", isRotated: false } },
};
