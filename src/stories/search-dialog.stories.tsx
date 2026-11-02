import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { SearchDialog } from "#/components/search/search-dialog";
import { Button } from "#/components/ui/button";
import { useStoryState } from "#/stories/use-story-state";

const meta = {
	title: "Search/Dialog",
	component: SearchDialog,
	args: { open: true, onOpenChange: fn() },
	parameters: { docs: { story: { inline: false, height: "600px" } } },
	render: function Render(initialArgs) {
		const [args, updateArgs] = useStoryState(initialArgs);
		return (
			<>
				<Button variant="outline" onClick={() => updateArgs({ open: true })}>
					Open dialog
				</Button>
				<SearchDialog
					{...args}
					onOpenChange={(open) => {
						args.onOpenChange(open);
						updateArgs({ open });
					}}
				/>
			</>
		);
	},
} satisfies Meta<typeof SearchDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {};
export const Phone: Story = {
	globals: { viewport: { value: "phone", isRotated: false } },
};
