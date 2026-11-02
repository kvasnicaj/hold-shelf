import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArticleCollectionPage } from "#/components/articles/article-collection-page";

import { sampleArticle, sampleArticles, sampleTags } from "#/stories/fixtures";
import { collectionActions } from "#/stories/helpers";

const meta = {
	title: "Articles/Collection page",
	component: ArticleCollectionPage,
	args: {
		...collectionActions,
		title: "Unread",
		searchPlaceholder: "Search articles…",
		emptyStateMessage: "No unread articles yet.",
		emptyStateHint: "Save an article to get started.",
		page: 1,
		articles: sampleArticles,
		total: 43,
		totalPages: 3,
		tagList: sampleTags,
		selected: new Set<string>(),
		selectedIds: [],
	},
	decorators: [
		(Story) => (
			<div className="w-[min(48rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof ArticleCollectionPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Populated: Story = {};
export const Empty: Story = { args: { articles: [], total: 0, totalPages: 0 } };
export const Selection: Story = {
	args: {
		selected: new Set([sampleArticle.id]),
		selectedIds: [sampleArticle.id],
	},
};
