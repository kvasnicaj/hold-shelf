import type { Meta, StoryObj } from "@storybook/react-vite";
import { SharedArticleList } from "#/components/shared-tag/shared-article-list";

import { sampleArticles } from "#/stories/fixtures";

const meta = {
	title: "Public/Shared article list",
	component: SharedArticleList,
	args: { articles: sampleArticles },
	decorators: [
		(Story) => (
			<div className="w-[min(48rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof SharedArticleList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Populated: Story = {};
export const Empty: Story = { args: { articles: [] } };
