import type { Meta, StoryObj } from "@storybook/react-vite";
import { LoginRoutePage } from "#/components/auth/login-route-page";

const meta = {
	title: "Pages/Sign in route",
	component: LoginRoutePage,
	parameters: { layout: "fullscreen", routePath: "/login" },
	tags: ["!autodocs"],
} satisfies Meta<typeof LoginRoutePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Phone: Story = {
	globals: { viewport: { value: "phone", isRotated: false } },
};
