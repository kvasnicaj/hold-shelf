import type { Meta, StoryObj } from "@storybook/react-vite";
import { SharedTagPage } from "#/components/shared-tag/shared-tag-page";

const meta = {
	title: "Pages/Shared list",
	component: SharedTagPage,
	parameters: {
		layout: "fullscreen",
		routePath: "/share/storybook-example-sharing-link",
	},
	tags: ["!autodocs"],
} satisfies Meta<typeof SharedTagPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = { parameters: { mockScenario: "empty" } };
export const Phone: Story = {
	globals: { viewport: { value: "phone", isRotated: false } },
};
