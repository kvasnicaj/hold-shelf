import type { Meta, StoryObj } from "@storybook/react-vite";
import { SharedArticleCard } from "#/components/shared-tag/shared-article-card";

import { sampleArticle } from "#/stories/fixtures";

const meta = {
	title: "Public/Shared article card",
	component: SharedArticleCard,
	args: { article: sampleArticle },
	decorators: [
		(Story) => (
			<div className="w-[min(48rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof SharedArticleCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const UrlOnly: Story = {
	args: {
		article: {
			...sampleArticle,
			title: null,
			description: null,
			hostname: null,
		},
	},
};
