import type { Meta, StoryObj } from "@storybook/react-vite";
import { PrivacyPage } from "#/components/privacy/privacy-page";

const meta = {
	title: "Pages/Privacy",
	component: PrivacyPage,
	parameters: { layout: "fullscreen" },
	tags: ["!autodocs"],
} satisfies Meta<typeof PrivacyPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Phone: Story = {
	globals: { viewport: { value: "phone", isRotated: false } },
};
