import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { SearchResultItem } from "#/components/search/search-result-item";
import { sampleArticle } from "#/stories/fixtures";

const meta = {
	title: "Search/Result item",
	component: SearchResultItem,
	args: {
		title: sampleArticle.title ?? "Article",
		preview: sampleArticle.description ?? "",
		faviconUrl: null,
		query: "reading",
		onSelect: fn(),
	},
	decorators: [
		(Story) => (
			<div className="w-[min(48rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof SearchResultItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const LongTitle: Story = {
	args: {
		title:
			"A long reading list for those days when there is enough time to follow your curiosity wherever it leads",
	},
};
