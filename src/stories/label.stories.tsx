import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";

const meta = {
	title: "UI/Label",
	component: Label,
	args: { htmlFor: "story-label-input", children: "Article URL" },
	render: (args) => (
		<div className="space-y-2">
			<Label {...args} />
			<Input id="story-label-input" placeholder="https://example.com/article" />
		</div>
	),
	decorators: [
		(Story) => (
			<div className="w-[min(24rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
