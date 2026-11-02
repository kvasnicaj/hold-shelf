import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ArchiveTable } from "#/components/archive/archive-table";
import { sampleArticles } from "#/stories/fixtures";
import { archiveActions } from "#/stories/helpers";
import { useStoryState } from "#/stories/use-story-state";

const meta = {
	title: "Library/Table",
	component: ArchiveTable,
	args: {
		...archiveActions,
		articles: sampleArticles,
		rowSelection: {},
		onRowSelectionChange: fn(),
		groupedByMonth: true,
	},
	render: function Render(initialArgs) {
		const [args, updateArgs] = useStoryState(initialArgs);
		return (
			<ArchiveTable
				{...args}
				onRowSelectionChange={(next) => {
					const rowSelection =
						typeof next === "function" ? next(args.rowSelection) : next;
					updateArgs({ rowSelection });
					args.onRowSelectionChange(next);
				}}
			/>
		);
	},
	decorators: [
		(Story) => (
			<div className="w-[min(48rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof ArchiveTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Grouped: Story = {};
export const Ungrouped: Story = { args: { groupedByMonth: false } };
export const Selected: Story = {
	args: { rowSelection: { "article-1": true } },
};
export const Empty: Story = { args: { articles: [] } };
