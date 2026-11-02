import type { Meta, StoryObj } from "@storybook/react-vite";
import { HomePage } from "#/components/home/home-page";

const meta = {
	title: "Pages/Home",
	component: HomePage,
	parameters: { layout: "fullscreen", routePath: "/app/home" },
	tags: ["!autodocs"],
	decorators: [
		(Story) => (
			<div className="mx-auto w-full max-w-6xl p-4 sm:p-8">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof HomePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = { parameters: { mockScenario: "empty" } };
export const Phone: Story = {
	globals: { viewport: { value: "phone", isRotated: false } },
};
