import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ArticleExternalLink } from "#/components/articles/article-external-link";
import { sampleArticle } from "#/stories/fixtures";

const meta = {
	title: "Articles/External link",
	component: ArticleExternalLink,
	args: {
		articleId: sampleArticle.id,
		href: sampleArticle.url,
		isRead: false,
		onOpenArticle: fn(),
		children: sampleArticle.title,
	},
} satisfies Meta<typeof ArticleExternalLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
