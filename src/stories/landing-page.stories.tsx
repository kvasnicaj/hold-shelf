import type { Meta, StoryObj } from "@storybook/react-vite";
import { LandingPage } from "#/components/home/landing-page";

const meta = {
	title: "Pages/Landing",
	component: LandingPage,
	parameters: { layout: "fullscreen" },
	tags: ["!autodocs"],
} satisfies Meta<typeof LandingPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Phone: Story = {
	globals: { viewport: { value: "phone", isRotated: false } },
};
