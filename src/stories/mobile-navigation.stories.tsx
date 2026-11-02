import type { Meta, StoryObj } from "@storybook/react-vite";
import { MobileNavigation } from "#/components/layout/mobile-navigation";

const meta = {
	title: "Layout/Mobile navigation",
	component: MobileNavigation,
	parameters: { layout: "fullscreen", routePath: "/app/articles" },
	tags: ["!autodocs"],
} satisfies Meta<typeof MobileNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Phone: Story = {
	globals: { viewport: { value: "phone", isRotated: false } },
};
