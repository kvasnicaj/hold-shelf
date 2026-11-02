import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArticleRowMenu } from "#/components/articles/article-row-menu";

import { sampleArticle, sampleArticles } from "#/stories/fixtures";
import { articleActions } from "#/stories/helpers";

const meta = {
	title: "Articles/Row menu",
	component: ArticleRowMenu,
	args: { ...articleActions, article: sampleArticle },
} satisfies Meta<typeof ArticleRowMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unread: Story = {};
export const Read: Story = { args: { article: sampleArticles[1] } };
export const Selected: Story = { args: { selected: true } };
