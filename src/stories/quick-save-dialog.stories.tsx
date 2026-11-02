import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { QuickSaveDialog } from "#/components/quick-save/quick-save-dialog";
import { Button } from "#/components/ui/button";
import { useStoryState } from "#/stories/use-story-state";

const meta = {
	title: "Save/Dialog",
	component: QuickSaveDialog,
	args: { open: true, onOpenChange: fn() },
	parameters: { docs: { story: { inline: false, height: "600px" } } },
	render: function Render(initialArgs) {
		const [args, updateArgs] = useStoryState(initialArgs);
		return (
			<>
				<Button variant="outline" onClick={() => updateArgs({ open: true })}>
					Open dialog
				</Button>
				<QuickSaveDialog
					{...args}
					onOpenChange={(open) => {
						args.onOpenChange(open);
						updateArgs({ open });
					}}
				/>
			</>
		);
	},
} satisfies Meta<typeof QuickSaveDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {};
export const Phone: Story = {
	globals: { viewport: { value: "phone", isRotated: false } },
};
