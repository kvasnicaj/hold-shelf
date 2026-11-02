import type { Meta, StoryObj } from "@storybook/react-vite";
import { PublicPageHeading } from "#/components/public/public-page-heading";
import { PublicPageLayout } from "#/components/public/public-page-layout";

const meta = {
	title: "Public/Layout",
	component: PublicPageLayout,
	args: {
		children: (
			<PublicPageHeading
				title="A shelf for your ideas"
				description="Save something worth returning to."
			/>
		),
	},
	parameters: {
		layout: "fullscreen",
		docs: { story: { inline: false, height: "600px" } },
	},
} satisfies Meta<typeof PublicPageLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Prose: Story = {};
export const Wide: Story = { args: { width: "wide" } };
export const Centered: Story = { args: { centered: true } };
