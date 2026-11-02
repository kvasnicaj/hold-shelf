import type { Meta, StoryObj } from "@storybook/react-vite";
import { PageHeading } from "#/components/layout/page-heading";
import { Button } from "#/components/ui/button";

const meta = {
	title: "Layout/Page heading",
	component: PageHeading,
	args: {
		title: "Unread",
		count: "24 articles",
		description: "Something worth making time for.",
		actions: <Button variant="outline">Save a link</Button>,
	},
	decorators: [
		(Story) => (
			<div className="w-[min(48rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof PageHeading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithoutCount: Story = { args: { count: undefined } };
export const TitleOnly: Story = {
	args: { count: undefined, description: undefined, actions: undefined },
};
