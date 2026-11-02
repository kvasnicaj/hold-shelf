import type { Meta, StoryObj } from "@storybook/react-vite";
import { TopBar } from "#/components/layout/top-bar";

const meta = {
	title: "Layout/Top bar",
	component: TopBar,
	parameters: { layout: "fullscreen", routePath: "/app/articles" },
	tags: ["!autodocs"],
} satisfies Meta<typeof TopBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Phone: Story = {
	globals: { viewport: { value: "phone", isRotated: false } },
};
