import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { KeyboardShortcutsDialog } from "#/components/shortcuts/keyboard-shortcuts-dialog";
import { Button } from "#/components/ui/button";
import { useStoryState } from "#/stories/use-story-state";

const meta = {
	title: "Shortcuts/Dialog",
	component: KeyboardShortcutsDialog,
	args: { open: true, onOpenChange: fn() },
	parameters: { docs: { story: { inline: false, height: "600px" } } },
	render: function Render(initialArgs) {
		const [args, updateArgs] = useStoryState(initialArgs);
		return (
			<>
				<Button variant="outline" onClick={() => updateArgs({ open: true })}>
					Open dialog
				</Button>
				<KeyboardShortcutsDialog
					{...args}
					onOpenChange={(open) => {
						args.onOpenChange(open);
						updateArgs({ open });
					}}
				/>
			</>
		);
	},
} satisfies Meta<typeof KeyboardShortcutsDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {};
export const Phone: Story = {
	globals: { viewport: { value: "phone", isRotated: false } },
};
