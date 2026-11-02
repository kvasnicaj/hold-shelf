import type { Meta, StoryObj } from "@storybook/react-vite";
import { RecentArticlesSection } from "#/components/home/recent-articles-section";

import { sampleRecent } from "#/stories/fixtures";
import { articleActions } from "#/stories/helpers";

const meta = {
	title: "Home/Recent articles",
	component: RecentArticlesSection,
	args: { ...sampleRecent, ...articleActions },
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
	args: { recentlySaved: [], recentlyFavorite: [], oldestUnread: [] },
};
