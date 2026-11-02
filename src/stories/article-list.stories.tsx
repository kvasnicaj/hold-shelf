import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArticleList } from "#/components/articles/article-list";
import { sampleArticle, sampleArticles } from "#/stories/fixtures";
import { articleActions } from "#/stories/helpers";
import { useStoryState } from "#/stories/use-story-state";

const meta = {
	title: "Articles/List",
	component: ArticleList,
	args: {
		...articleActions,
		articles: sampleArticles,
		selected: new Set<string>(),
	},
	render: function Render(initialArgs) {
		const [args, updateArgs] = useStoryState(initialArgs);
		return (
			<ArticleList
				{...args}
				onSelect={(id, selected) => {
					const next = new Set(args.selected);
					if (selected) next.add(id);
					else next.delete(id);
					args.onSelect(id, selected);
					updateArgs({ selected: next });
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
} satisfies Meta<typeof ArticleList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Populated: Story = {};
export const Selected: Story = {
	args: { selected: new Set([sampleArticle.id]) },
};
export const Empty: Story = { args: { articles: [] } };
export const Phone: Story = {
	globals: { viewport: { value: "phone", isRotated: false } },
};
