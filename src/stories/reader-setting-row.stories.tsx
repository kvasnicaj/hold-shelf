import type { Meta, StoryObj } from "@storybook/react-vite";
import { ReaderSettingRow } from "#/components/article-reader/reader-setting-row";

const meta = {
	title: "Reader/Setting row",
	component: ReaderSettingRow,
	args: {
		label: "Text size",
		children: <span className="tabular-nums">19 px</span>,
	},
	decorators: [
		(Story) => (
			<div className="w-[min(24rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof ReaderSettingRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
