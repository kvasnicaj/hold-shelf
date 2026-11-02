import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { TrashDeleteDialog } from "#/components/library/trash-delete-dialog";
import { Button } from "#/components/ui/button";
import { sampleArticle } from "#/stories/fixtures";
import { useStoryState } from "#/stories/use-story-state";

const meta = {
	title: "Library/Delete confirmation",
	component: TrashDeleteDialog,
	args: {
		open: true,
		all: false,
		articleTitle: sampleArticle.title ?? "Article",
		pending: false,
		error: null,
		onClose: fn(),
		onConfirm: fn(),
	},
	parameters: { docs: { story: { inline: false, height: "480px" } } },
	render: function Render(initialArgs) {
		const [args, updateArgs] = useStoryState(initialArgs);
		return (
			<>
				<Button variant="outline" onClick={() => updateArgs({ open: true })}>
					Open confirmation
				</Button>
				<TrashDeleteDialog
					{...args}
					onClose={() => {
						args.onClose();
						updateArgs({ open: false });
					}}
				/>
			</>
		);
	},
} satisfies Meta<typeof TrashDeleteDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OneArticle: Story = {};
export const EmptyTrash: Story = { args: { all: true } };
export const Pending: Story = { args: { pending: true } };
export const Failure: Story = {
	args: { error: "Could not delete these articles. Please try again." },
};
