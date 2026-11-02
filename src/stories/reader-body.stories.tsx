import type { Meta, StoryObj } from "@storybook/react-vite";
import { ReaderBody } from "#/components/article-reader/reader-body";

import { sampleReader, sampleSettings } from "#/stories/fixtures";

const meta = {
	title: "Reader/Body",
	component: ReaderBody,
	args: { data: sampleReader, settings: sampleSettings },
	decorators: [
		(Story) => (
			<div className="h-[42rem] w-[min(48rem,calc(100vw-2rem))] overflow-hidden border bg-card">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof ReaderBody>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Serif: Story = {};
export const Sans: Story = {
	args: { settings: { ...sampleSettings, font: "sans", fontSize: 21 } },
};
export const Unavailable: Story = {
	args: {
		data: {
			...sampleReader,
			content: {
				status: "unavailable",
				reason: "The original article could not be read.",
			},
		},
	},
};
