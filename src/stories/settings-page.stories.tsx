import type { Meta, StoryObj } from "@storybook/react-vite";
import { SettingsPage } from "#/components/settings/settings-page";

const meta = {
	title: "Pages/Settings",
	component: SettingsPage,
	parameters: { layout: "fullscreen", routePath: "/app/settings" },
	tags: ["!autodocs"],
	decorators: [
		(Story) => (
			<div className="mx-auto w-full max-w-6xl p-4 sm:p-8">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof SettingsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Phone: Story = {
	globals: { viewport: { value: "phone", isRotated: false } },
};
