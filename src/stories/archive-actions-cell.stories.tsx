import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArchiveActionsCell } from "#/components/archive/archive-actions-cell";
import { ArchiveActionsContext } from "#/components/archive/archive-actions-context";
import { sampleArticle } from "#/stories/fixtures";
import { archiveActions } from "#/stories/helpers";

const meta = {
	title: "Library/Actions cell",
	component: ArchiveActionsCell,
	args: { row: { original: sampleArticle } },
	decorators: [
		(Story) => (
			<ArchiveActionsContext.Provider value={archiveActions}>
				<div className="group flex gap-2 [&>div]:opacity-100">
					<Story />
				</div>
			</ArchiveActionsContext.Provider>
		),
	],
} satisfies Meta<typeof ArchiveActionsCell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
