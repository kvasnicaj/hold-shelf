import type { Meta, StoryObj } from "@storybook/react-vite";
import { CliDocsPage } from "#/components/cli-docs/cli-docs-page";

const meta = {
	title: "Pages/CLI docs",
	component: CliDocsPage,
	parameters: { layout: "fullscreen" },
	tags: ["!autodocs"],
} satisfies Meta<typeof CliDocsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Phone: Story = {
	globals: { viewport: { value: "phone", isRotated: false } },
};
