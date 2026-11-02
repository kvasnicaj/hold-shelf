import type { Meta, StoryObj } from "@storybook/react-vite";
import { CliCard } from "#/components/settings/cli-card";

const meta = {
	title: "Settings/CLI",
	component: CliCard,
	tags: ["!autodocs"],
	decorators: [
		(Story) => (
			<div className="w-[min(48rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof CliCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
