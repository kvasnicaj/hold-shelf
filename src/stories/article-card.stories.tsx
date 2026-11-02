import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent } from "storybook/test";
import { ArticleCard } from "#/components/articles/article-card";
import { sampleArticle, sampleArticles } from "#/stories/fixtures";
import { articleActions } from "#/stories/helpers";
import { useStoryState } from "#/stories/use-story-state";

const meta = {
	title: "Articles/Card",
	component: ArticleCard,
	args: { ...articleActions, article: sampleArticle, selected: false },
	render: function Render(initialArgs) {
		const [args, updateArgs] = useStoryState(initialArgs);
		return (
			<ArticleCard
				{...args}
				onSelect={(id, selected) => {
					args.onSelect(id, selected);
					updateArgs({ selected });
				}}
				onToggleRead={(id, isRead) => {
					args.onToggleRead(id, isRead);
					updateArgs({ article: { ...args.article, isRead } });
				}}
				onToggleFavorite={(id, isFavorite) => {
					args.onToggleFavorite(id, isFavorite);
					updateArgs({ article: { ...args.article, isFavorite } });
				}}
			/>
		);
	},
	decorators: [
		(Story) => (
			<div className="w-[min(48rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof ArticleCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unread: Story = {
	play: async ({ canvas, args }) => {
		await userEvent.tab();
		const selection = canvas.getByRole("checkbox", {
			name: `Select ${sampleArticle.title}`,
		});
		await expect(selection).toHaveFocus();
		await userEvent.keyboard(" ");
		await expect(selection).toBeChecked();
		await expect(args.onOpenArticle).not.toHaveBeenCalled();
		await userEvent.tab();
		await expect(
			canvas.getByRole("link", { name: sampleArticle.title ?? "" }),
		).toHaveFocus();
		await userEvent.keyboard("{Enter}");
		await expect(args.onOpenArticle).toHaveBeenCalledWith(
			sampleArticle.id,
			false,
		);
	},
};
export const Read: Story = { args: { article: sampleArticles[1] } };
export const Selected: Story = {
	args: { selected: true, selectionMode: true },
};
export const WithoutTags: Story = {
	args: { article: { ...sampleArticle, tags: [] } },
};
