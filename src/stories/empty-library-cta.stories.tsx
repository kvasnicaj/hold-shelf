import type { Meta, StoryObj } from "@storybook/react-vite";
import { EmptyLibraryCta } from "#/components/home/empty-library-cta";

const meta = {
	title: "Home/Empty library",
	component: EmptyLibraryCta,
	decorators: [
		(Story) => (
			<div className="w-[min(48rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof EmptyLibraryCta>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
