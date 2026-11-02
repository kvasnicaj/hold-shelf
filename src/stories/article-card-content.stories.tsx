import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ArticleCardContent } from "#/components/articles/article-card-content";
import { sampleArticle, sampleArticles } from "#/stories/fixtures";

const meta = {
	title: "Articles/Card content",
	component: ArticleCardContent,
	args: {
		article: sampleArticle,
		onOpenArticle: fn(),
		timeAgo: "Unread for 7 days",
	},
	decorators: [
		(Story) => (
			<div className="w-[min(48rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof ArticleCardContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unread: Story = {};
export const Read: Story = { args: { article: sampleArticles[1] } };
export const NoMetadata: Story = {
	args: {
		article: {
			...sampleArticle,
			title: null,
			description: null,
			hostname: null,
			tags: [],
		},
	},
};
export const LongTitle: Story = {
	args: {
		article: {
			...sampleArticle,
			title:
				"An unusually long article title about the many small decisions that make a library easier to browse and a reading habit easier to keep over time",
		},
	},
};
