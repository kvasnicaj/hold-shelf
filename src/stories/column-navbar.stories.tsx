import type { Meta, StoryObj } from "@storybook/react-vite";
import { ColumnNavbar } from "#/components/layout/column-navbar";
import { Button } from "#/components/ui/button";

const meta = {
	title: "Layout/Column navbar",
	component: ColumnNavbar,
	args: {
		"aria-label": "Reader navigation",
		left: [
			<Button key="close" variant="ghost" size="sm">
				Close
			</Button>,
		],
		center: [
			<span key="title" className="truncate text-sm">
				Making room for a reading habit
			</span>,
		],
		right: [
			<Button key="more" variant="outline" size="sm">
				Actions
			</Button>,
		],
	},
	decorators: [
		(Story) => (
			<div className="w-[min(48rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof ColumnNavbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = {};
export const Phone: Story = {
	globals: { viewport: { value: "phone", isRotated: false } },
};
