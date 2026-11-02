import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArticleCardActions } from "#/components/articles/article-card-actions";

import { sampleArticle } from "#/stories/fixtures";
import { articleActions } from "#/stories/helpers";

const meta = {
	title: "Articles/Card actions",
	component: ArticleCardActions,
	args: {
		...articleActions,
		articleId: sampleArticle.id,
		isRead: false,
		isFavorite: false,
		tagIds: ["design"],
		className: "flex !opacity-100",
	},
} satisfies Meta<typeof ArticleCardActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unread: Story = {};
export const ReadFavorite: Story = { args: { isRead: true, isFavorite: true } };
