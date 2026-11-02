import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArticleStateMarks } from "#/components/articles/article-state-marks";

const meta = {
	title: "Articles/State marks",
	component: ArticleStateMarks,
	args: { isRead: false, isFavorite: false },
} satisfies Meta<typeof ArticleStateMarks>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unread: Story = {};
export const Read: Story = { args: { isRead: true } };
export const UnreadFavorite: Story = { args: { isFavorite: true } };
export const ReadFavorite: Story = { args: { isRead: true, isFavorite: true } };
