import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { PageSearchField } from "#/components/layout/page-search-field";
import { useStoryState } from "#/stories/use-story-state";

const meta = {
	title: "Layout/Search field",
	component: PageSearchField,
	args: {
		value: "",
		placeholder: "Search your library…",
		ariaLabel: "Search your library",
		onSearch: fn(),
	},
	render: function Render(initialArgs) {
		const [args, updateArgs] = useStoryState(initialArgs);
		return (
			<PageSearchField
				{...args}
				onSearch={(value) => {
					args.onSearch(value);
					updateArgs({ value });
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
} satisfies Meta<typeof PageSearchField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const Filled: Story = { args: { value: "reading" } };
export const Debounced: Story = { args: { debounceMs: 250 } };
