import type { Meta, StoryObj } from "@storybook/react-vite";
import { PublicSection } from "#/components/public/public-section";

const meta = {
	title: "Public/Section",
	component: PublicSection,
	args: {
		title: "Read at your own pace",
		children: (
			<p>
				Your saved text and reading position stay with each article, ready
				whenever you return.
			</p>
		),
	},
	decorators: [
		(Story) => (
			<div className="w-[min(48rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof PublicSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
