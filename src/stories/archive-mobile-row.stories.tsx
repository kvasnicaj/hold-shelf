import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ArchiveMobileRow } from "#/components/archive/archive-mobile-row";
import { sampleArticle, sampleArticles } from "#/stories/fixtures";
import { archiveActions } from "#/stories/helpers";

const meta = {
	title: "Library/Mobile row",
	component: ArchiveMobileRow,
	args: {
		...archiveActions,
		article: sampleArticle,
		isSelected: false,
		selectionMode: false,
		onSelectedChange: fn(),
	},
	decorators: [
		(Story) => (
			<div className="w-[min(24rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof ArchiveMobileRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unread: Story = {};
export const Selected: Story = {
	args: { isSelected: true, selectionMode: true },
};
export const Read: Story = { args: { article: sampleArticles[1] } };
