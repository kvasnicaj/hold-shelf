import type { Meta, StoryObj } from "@storybook/react-vite";
import { AppSidebar } from "#/components/layout/app-sidebar";

const meta = {
	title: "Layout/App sidebar",
	component: AppSidebar,
	parameters: { routePath: "/app/articles" },
	tags: ["!autodocs"],
	decorators: [
		(Story) => (
			<div className="flex h-[min(48rem,100vh)] w-56">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof AppSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unread: Story = {};
export const ActiveTag: Story = {
	parameters: { routePath: "/app/tags?tag=design" },
};
export const EmptyLibrary: Story = { parameters: { mockScenario: "empty" } };
