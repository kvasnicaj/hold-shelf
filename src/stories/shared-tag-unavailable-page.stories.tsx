import type { Meta, StoryObj } from "@storybook/react-vite";
import { SharedTagUnavailablePage } from "#/components/shared-tag/shared-tag-unavailable-page";

const meta = {
	title: "Pages/Unavailable shared list",
	component: SharedTagUnavailablePage,
	parameters: { layout: "fullscreen" },
	tags: ["!autodocs"],
} satisfies Meta<typeof SharedTagUnavailablePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Phone: Story = {
	globals: { viewport: { value: "phone", isRotated: false } },
};
