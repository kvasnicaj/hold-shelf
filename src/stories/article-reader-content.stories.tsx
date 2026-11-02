import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArticleReaderContent } from "#/components/article-reader/article-reader-content";

import { sampleMarkdown } from "#/stories/fixtures";

const meta = {
	title: "Reader/Content",
	component: ArticleReaderContent,
	args: { markdown: sampleMarkdown },
	decorators: [
		(Story) => (
			<div className="prose prose-hold max-w-[64ch] font-serif">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof ArticleReaderContent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const RichText: Story = {};
export const LongContent: Story = {
	args: { markdown: sampleMarkdown.repeat(4) },
};
export const Empty: Story = { args: { markdown: "" } };
