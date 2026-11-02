import type { Meta, StoryObj } from "@storybook/react-vite";
import { TagPickerPanel } from "#/components/tags/tag-picker-panel";
import { useTagPicker } from "#/components/tags/use-tag-picker";
import { Button } from "#/components/ui/button";
import { Popover, PopoverTrigger } from "#/components/ui/popover";
import { sampleArticle } from "#/stories/fixtures";
import { articleActions } from "#/stories/helpers";

const meta = {
	title: "Tags/Picker panel",
	render: function Render() {
		const picker = useTagPicker({
			...articleActions,
			selectedTagIds: ["design"],
			articleIds: [sampleArticle.id],
		});
		return (
			<Popover open={picker.open} onOpenChange={picker.changeOpen}>
				<PopoverTrigger asChild>
					<Button variant="outline">Choose article tags</Button>
				</PopoverTrigger>
				<TagPickerPanel picker={picker} title="Article tags" />
			</Popover>
		);
	},
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
