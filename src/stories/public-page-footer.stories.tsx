import type { Meta, StoryObj } from "@storybook/react-vite";
import { PublicPageFooter } from "#/components/public/public-page-footer";

const meta = {
	title: "Public/Footer",
	component: PublicPageFooter,
	decorators: [
		(Story) => (
			<div className="w-[min(48rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof PublicPageFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
