import type { Meta, StoryObj } from "@storybook/react-vite";
import { AboutPage } from "#/components/about/about-page";

const meta = {
	title: "Pages/About",
	component: AboutPage,
	parameters: { layout: "fullscreen" },
	tags: ["!autodocs"],
} satisfies Meta<typeof AboutPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Phone: Story = {
	globals: { viewport: { value: "phone", isRotated: false } },
};
