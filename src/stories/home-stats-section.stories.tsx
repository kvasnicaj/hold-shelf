import type { Meta, StoryObj } from "@storybook/react-vite";
import { HomeStatsSection } from "#/components/home/home-stats-section";

import { sampleStats } from "#/stories/fixtures";

const meta = {
	title: "Home/Stats",
	component: HomeStatsSection,
	args: { stats: sampleStats },
	decorators: [
		(Story) => (
			<div className="w-[min(48rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof HomeStatsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Populated: Story = {};
export const Empty: Story = {
	args: { stats: { total: 0, unread: 0, savedThisWeek: 0, readThisWeek: 0 } },
};
