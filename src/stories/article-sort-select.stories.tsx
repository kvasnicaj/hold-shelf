import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ArticleSortSelect } from "#/components/articles/article-sort-select";
import { useStoryState } from "#/stories/use-story-state";

const meta = {
	title: "Articles/Sort select",
	component: ArticleSortSelect,
	args: { value: "newest", onChange: fn(), className: "w-44" },
	render: function Render(initialArgs) {
		const [args, updateArgs] = useStoryState(initialArgs);
		return (
			<ArticleSortSelect
				{...args}
				onChange={(value) => {
					args.onChange(value);
					updateArgs({ value });
				}}
			/>
		);
	},
} satisfies Meta<typeof ArticleSortSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Newest: Story = {};
export const Oldest: Story = { args: { value: "oldest" } };
export const Title: Story = { args: { value: "title" } };
