import type { Meta, StoryObj } from "@storybook/react-vite";
import { TagsPage } from "#/components/tags/tags-page";

const meta = {
	title: "Pages/Tags",
	component: TagsPage,
	parameters: { layout: "fullscreen", routePath: "/app/tags" },
	tags: ["!autodocs"],
	decorators: [
		(Story) => (
			<div className="mx-auto w-full max-w-6xl p-4 sm:p-8">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof TagsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = { parameters: { mockScenario: "empty" } };
export const SelectedTag: Story = {
	parameters: { routePath: "/app/tags?tag=design" },
};
export const Phone: Story = {
	globals: { viewport: { value: "phone", isRotated: false } },
};
