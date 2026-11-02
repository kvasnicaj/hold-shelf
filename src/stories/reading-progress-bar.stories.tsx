import type { Meta, StoryObj } from "@storybook/react-vite";
import { ReadingProgressBar } from "#/components/articles/reading-progress-bar";

const meta = {
	title: "Articles/Reading progress",
	component: ReadingProgressBar,
	args: { percent: 42, className: "w-80 max-w-full" },
	argTypes: {
		percent: { control: { type: "range", min: 0, max: 100, step: 1 } },
	},
} satisfies Meta<typeof ReadingProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InProgress: Story = {};
export const NotStarted: Story = { args: { percent: 0 } };
export const Finished: Story = { args: { percent: 100 } };
