import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArticleMetaLine } from "#/components/articles/article-meta-line";

import { sampleTags } from "#/stories/fixtures";

const meta = {
	title: "Articles/Metadata",
	component: ArticleMetaLine,
	args: {
		hostname: "example.com",
		timeAgo: "Unread for 7 days",
		tags: sampleTags,
	},
	decorators: [
		(Story) => (
			<div className="w-[min(48rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof ArticleMetaLine>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithTags: Story = {};
export const WithoutTags: Story = { args: { tags: [] } };
export const WithoutHostname: Story = { args: { hostname: null } };
