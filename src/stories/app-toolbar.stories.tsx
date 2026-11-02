import type { Meta, StoryObj } from "@storybook/react-vite";
import { AppToolbar } from "#/components/layout/app-toolbar";

const meta = {
	title: "Layout/Account toolbar",
	component: AppToolbar,
	parameters: { layout: "fullscreen", routePath: "/app/articles" },
	tags: ["!autodocs"],
} satisfies Meta<typeof AppToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Phone: Story = {
	globals: { viewport: { value: "phone", isRotated: false } },
};
