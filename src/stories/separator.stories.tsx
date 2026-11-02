import type { Meta, StoryObj } from "@storybook/react-vite";
import { Separator } from "#/components/ui/separator";

const meta = {
	title: "UI/Separator",
	component: Separator,
	args: { decorative: true },
	render: (args) => (
		<div className="flex h-12 w-64 items-center justify-around gap-4">
			<span>Library</span>
			<Separator {...args} />
			<span>Tags</span>
		</div>
	),
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Vertical: Story = { args: { orientation: "vertical" } };
export const Horizontal: Story = {
	render: (args) => (
		<div className="w-64 space-y-3">
			<p>Library</p>
			<Separator {...args} />
			<p>Tags</p>
		</div>
	),
};
