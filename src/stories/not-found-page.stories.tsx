import type { Meta, StoryObj } from "@storybook/react-vite";
import { NotFoundPage } from "#/components/layout/not-found-page";

const meta = {
	title: "Pages/Not found",
	component: NotFoundPage,
	parameters: { layout: "fullscreen" },
	tags: ["!autodocs"],
} satisfies Meta<typeof NotFoundPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Phone: Story = {
	globals: { viewport: { value: "phone", isRotated: false } },
};
