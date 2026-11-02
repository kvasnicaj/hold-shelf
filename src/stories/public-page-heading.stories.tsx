import type { Meta, StoryObj } from "@storybook/react-vite";
import { PublicPageHeading } from "#/components/public/public-page-heading";

const meta = {
	title: "Public/Page heading",
	component: PublicPageHeading,
	args: {
		title: "Your next good read is waiting",
		eyebrow: "Hold Shelf",
		description:
			"Save articles, keep your place, and come back when you have time.",
	},
	decorators: [
		(Story) => (
			<div className="w-[min(48rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof PublicPageHeading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LeftAligned: Story = {};
export const Centered: Story = { args: { align: "center" } };
