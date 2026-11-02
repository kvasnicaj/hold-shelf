import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ArticlesHeader } from "#/components/articles/articles-header";

const meta = {
	title: "Articles/Header",
	component: ArticlesHeader,
	args: {
		title: "Unread",
		total: 24,
		sort: "newest",
		onSortChange: fn(),
		searchValue: "",
		searchPlaceholder: "Search articles…",
		onSearch: fn(),
		emptyStateMessage: "No unread articles yet.",
		emptyStateHint: "Save an article to get started.",
	},
	decorators: [
		(Story) => (
			<div className="w-[min(48rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof ArticlesHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = { args: { total: 0 } };
export const SearchNoResults: Story = {
	args: {
		total: 0,
		searchValue: "no matches",
		emptyStateMessage: "No articles match your search.",
		emptyStateHint: undefined,
	},
};
