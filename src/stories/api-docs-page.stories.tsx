import type { Meta, StoryObj } from "@storybook/react-vite";
import { ApiDocsPage } from "#/components/api-docs/api-docs-page";

const meta = {
	title: "Pages/API docs",
	component: ApiDocsPage,
	parameters: { layout: "fullscreen" },
	tags: ["!autodocs"],
} satisfies Meta<typeof ApiDocsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Phone: Story = {
	globals: { viewport: { value: "phone", isRotated: false } },
};
