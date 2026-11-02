import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ArchiveFilters } from "#/components/archive/archive-filters";
import { sampleTags } from "#/stories/fixtures";
import { useStoryState } from "#/stories/use-story-state";

const meta = {
	title: "Library/Filters",
	component: ArchiveFilters,
	args: {
		selectedTagIds: [],
		q: "",
		filter: "all",
		sort: "newest",
		tagList: sampleTags,
		onSearch: fn(),
		onTagsChange: fn(),
		onFilterChange: fn(),
		onSortChange: fn(),
	},
	render: function Render(initialArgs) {
		const [args, updateArgs] = useStoryState(initialArgs);
		return (
			<ArchiveFilters
				{...args}
				onSearch={(q) => updateArgs({ q })}
				onTagsChange={(selectedTagIds) => updateArgs({ selectedTagIds })}
				onFilterChange={(filter) => updateArgs({ filter })}
				onSortChange={(sort) => updateArgs({ sort })}
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
} satisfies Meta<typeof ArchiveFilters>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Filtered: Story = {
	args: { selectedTagIds: ["design"], filter: "unread", q: "reading" },
};
export const Phone: Story = {
	globals: { viewport: { value: "phone", isRotated: false } },
};
