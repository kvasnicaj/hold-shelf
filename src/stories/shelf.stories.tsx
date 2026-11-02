import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Shelf } from "#/components/home/shelf";
import { ShelfItem } from "#/components/home/shelf-item";
import { sampleArticle } from "#/stories/fixtures";

const meta = {
	title: "Home/Shelf",
	component: Shelf,
	args: {
		title: "Oldest unread",
		href: "/app/articles",
		linkLabel: "Unread",
		isEmpty: false,
		emptyMessage: "No unread articles right now.",
		children: <ShelfItem article={sampleArticle} onOpenArticle={fn()} />,
	},
	decorators: [
		(Story) => (
			<div className="w-[min(24rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof Shelf>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Populated: Story = {};
export const Empty: Story = { args: { isEmpty: true } };
