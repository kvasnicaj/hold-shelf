import type { Meta, StoryObj } from "@storybook/react-vite";
import { MonthGroupLabel } from "#/components/archive/month-group-label";

const meta = {
	title: "Library/Month label",
	component: MonthGroupLabel,
	args: { label: "October 2026", count: 12 },
} satisfies Meta<typeof MonthGroupLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
