import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ArticleCollectionRoutePage } from "#/components/articles/article-collection-route-page";
import { sampleArticles, sampleTags } from "#/stories/fixtures";

const meta = {
	title: "Articles/Collection route page",
	component: ArticleCollectionRoutePage,
	args: {
		initialData: {
			articles: { items: sampleArticles, total: 3 },
			tags: sampleTags,
		},
		search: {},
		navigate: fn(),
		queryKey: "storybook-collection",
		filters: {},
		title: "Your articles",
		searchPlaceholder: "Search articles…",
		emptyStateMessage: "Nothing here yet.",
		filteredEmptyStateMessage: "No articles match.",
		emptyStateHint: "Save a link to get started.",
	},
	decorators: [
		(Story) => (
			<div className="w-[min(48rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof ArticleCollectionRoutePage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
