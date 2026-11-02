import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContinueReadingSection } from "#/components/home/continue-reading-section";

import { sampleContinueReading } from "#/stories/fixtures";

const meta = {
	title: "Home/Continue reading",
	component: ContinueReadingSection,
	args: { initialData: sampleContinueReading },
	tags: ["!autodocs"],
	decorators: [
		(Story) => (
			<div className="w-[min(48rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof ContinueReadingSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const InProgress: Story = {};
export const Empty: Story = {
	args: { initialData: [] },
	parameters: { mockScenario: "empty" },
};
