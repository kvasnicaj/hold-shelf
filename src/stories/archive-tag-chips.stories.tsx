import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ArchiveTagChips } from "#/components/archive/archive-tag-chips";
import { sampleTags } from "#/stories/fixtures";
import { useStoryState } from "#/stories/use-story-state";

const meta = {
	title: "Library/Tag chips",
	component: ArchiveTagChips,
	args: { tags: sampleTags, selectedTagIds: [], onChange: fn() },
	render: function Render(initialArgs) {
		const [args, updateArgs] = useStoryState(initialArgs);
		return (
			<ArchiveTagChips
				{...args}
				onChange={(selectedTagIds) => {
					args.onChange(selectedTagIds);
					updateArgs({ selectedTagIds });
				}}
			/>
		);
	},
	decorators: [
		(Story) => (
			<div className="w-[min(24rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof ArchiveTagChips>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllTags: Story = {};
export const Selected: Story = {
	args: { selectedTagIds: ["design", "engineering"] },
};
export const NoTags: Story = { args: { tags: [] } };
