import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ShelfItem } from "#/components/home/shelf-item";
import { sampleArticle, sampleArticles } from "#/stories/fixtures";

const meta = {
	title: "Home/Shelf item",
	component: ShelfItem,
	args: {
		article: sampleArticle,
		onOpenArticle: fn(),
		note: "Unread for 7 days",
	},
	decorators: [
		(Story) => (
			<ul className="w-[min(24rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</ul>
		),
	],
} satisfies Meta<typeof ShelfItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unread: Story = {};
export const Read: Story = {
	args: { article: sampleArticles[1], note: "Saved last month" },
};
export const LongTitle: Story = {
	args: {
		article: {
			...sampleArticle,
			title:
				"A longer piece about how to build and maintain a thoughtful personal library for a lifetime of learning",
		},
	},
};
