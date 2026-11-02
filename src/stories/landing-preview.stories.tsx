import type { Meta, StoryObj } from "@storybook/react-vite";
import { LandingPreview } from "#/components/home/landing-preview";

const meta = {
	title: "Home/Landing preview",
	component: LandingPreview,
	decorators: [
		(Story) => (
			<div className="w-[min(48rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof LandingPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
