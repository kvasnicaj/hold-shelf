import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArticleReaderFallback } from "#/components/article-reader/article-reader-fallback";

import { sampleArticle } from "#/stories/fixtures";

const meta = {
	title: "Reader/Unavailable content",
	component: ArticleReaderFallback,
	args: {
		url: sampleArticle.url,
		reason:
			"The publisher only provides an article preview. Open the original to keep reading.",
	},
	decorators: [
		(Story) => (
			<div className="w-[min(24rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof ArticleReaderFallback>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
