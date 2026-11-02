import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArticlesPage } from "#/components/articles/articles-page";

const meta = {
	title: "Pages/Unread",
	component: ArticlesPage,
	parameters: { layout: "fullscreen", routePath: "/app/articles" },
	tags: ["!autodocs"],
	decorators: [
		(Story) => (
			<div className="mx-auto w-full max-w-6xl p-4 sm:p-8">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof ArticlesPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = { parameters: { mockScenario: "empty" } };
export const SearchNoResults: Story = {
	parameters: { routePath: "/app/articles?q=unmatched-example" },
};
export const Phone: Story = {
	globals: { viewport: { value: "phone", isRotated: false } },
};
