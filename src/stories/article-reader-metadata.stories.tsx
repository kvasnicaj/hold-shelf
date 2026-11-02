import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArticleReaderMetadata } from "#/components/article-reader/article-reader-metadata";

import { sampleReader } from "#/stories/fixtures";

const meta = {
	title: "Reader/Metadata",
	component: ArticleReaderMetadata,
	args: { payload: sampleReader },
	decorators: [
		(Story) => (
			<div className="w-[min(48rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof ArticleReaderMetadata>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unread: Story = {};
export const Read: Story = {
	args: {
		payload: {
			...sampleReader,
			article: { ...sampleReader.article, isRead: true },
		},
	},
};
export const Unavailable: Story = {
	args: {
		payload: {
			...sampleReader,
			content: { status: "unavailable", reason: "No saved text" },
		},
	},
};
