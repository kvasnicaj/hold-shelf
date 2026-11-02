import type { Meta, StoryObj } from "@storybook/react-vite";
import { FavoritesPage } from "#/components/favorites/favorites-page";

const meta = {
	title: "Pages/Favorites",
	component: FavoritesPage,
	parameters: { layout: "fullscreen", routePath: "/app/favorites" },
	tags: ["!autodocs"],
	decorators: [
		(Story) => (
			<div className="mx-auto w-full max-w-6xl p-4 sm:p-8">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof FavoritesPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = { parameters: { mockScenario: "empty" } };
export const SearchNoResults: Story = {
	parameters: { routePath: "/app/favorites?q=unmatched-example" },
};
export const Phone: Story = {
	globals: { viewport: { value: "phone", isRotated: false } },
};
