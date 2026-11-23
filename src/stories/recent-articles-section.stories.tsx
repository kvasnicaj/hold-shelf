import type { Meta, StoryObj } from "@storybook/react-vite";
import { RecentArticlesSection } from "#/components/home/recent-articles-section";

import {
	sampleContinueReading,
	sampleRecent,
	sampleStats,
} from "#/stories/fixtures";
import { articleActions } from "#/stories/helpers";

const meta = {
	title: "Home/Recent articles",
	component: RecentArticlesSection,
	args: {
		...sampleRecent,
		unreadCount: sampleStats.unread,
		inProgress: sampleContinueReading,
		...articleActions,
	},
	decorators: [
		(Story) => (
			<div className="w-[min(72rem,calc(100vw-2rem))]">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof RecentArticlesSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Populated: Story = {};
export const Empty: Story = {
	args: {
		latestUnread: [],
		unreadCount: 0,
		inProgress: [],
		recentlySaved: [],
		recentlyFavorite: [],
		oldestUnread: [],
	},
};
