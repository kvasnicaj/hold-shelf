import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { ArticleCardMobile } from "#/components/articles/article-card-mobile";
import { sampleArticle, sampleArticles } from "#/stories/fixtures";
import { articleActions } from "#/stories/helpers";
import { useStoryState } from "#/stories/use-story-state";

const meta = {
	title: "Articles/Mobile card",
	component: ArticleCardMobile,
	args: { ...articleActions, article: sampleArticle, selected: false },
	render: function Render(initialArgs) {
		const [args, updateArgs] = useStoryState(initialArgs);
		return (
			<ArticleCardMobile
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
			<div className="w-[min(24rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof ArticleCardMobile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unread: Story = {
	play: async ({ canvas, canvasElement, args }) => {
		const trigger = canvas.getByRole("button", {
			name: `More actions for ${sampleArticle.title}`,
		});
		const body = within(canvasElement.ownerDocument.body);
		await userEvent.click(trigger);
		const menu = within(await body.findByRole("menu"));
		await userEvent.click(menu.getByRole("menuitem", { name: "Mark as read" }));
		await expect(args.onToggleRead).toHaveBeenCalledWith(
			sampleArticle.id,
			true,
		);
		await expect(args.onOpenArticle).not.toHaveBeenCalled();
		await waitFor(() =>
			expect(body.queryByRole("menu")).not.toBeInTheDocument(),
		);
		await userEvent.click(trigger);
		await waitFor(() =>
			expect(
				body.getByRole("menuitem", { name: "Mark as unread" }),
			).toBeVisible(),
		);
		await userEvent.keyboard("{Escape}");
		await waitFor(() => expect(trigger).toHaveFocus());
	},
};
export const Read: Story = { args: { article: sampleArticles[1] } };
export const Selected: Story = {
	args: { selected: true, selectionMode: true },
};
export const WithoutTags: Story = {
	args: { article: { ...sampleArticle, tags: [] } },
};
