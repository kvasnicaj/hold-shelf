import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ArchiveTagsCombobox } from "#/components/archive/archive-tags-combobox";
import { sampleTags } from "#/stories/fixtures";
import { useStoryState } from "#/stories/use-story-state";

const meta = {
	title: "Library/Tags combobox",
	component: ArchiveTagsCombobox,
	args: { tags: sampleTags, selectedTagIds: [], onChange: fn() },
	render: function Render(initialArgs) {
		const [args, updateArgs] = useStoryState(initialArgs);
		return (
			<ArchiveTagsCombobox
				{...args}
				onChange={(selectedTagIds) => {
					args.onChange(selectedTagIds);
					updateArgs({ selectedTagIds });
				}}
			/>
		);
	},
} satisfies Meta<typeof ArchiveTagsCombobox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllTags: Story = {};
export const Selected: Story = {
	args: { selectedTagIds: ["design", "engineering"] },
};
export const NoTags: Story = { args: { tags: [] } };
