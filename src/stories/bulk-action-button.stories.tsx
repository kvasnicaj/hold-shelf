import { Check } from "@phosphor-icons/react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { BulkActionButton } from "#/components/articles/bulk-action-button";

const meta = {
	title: "Articles/Bulk action button",
	component: BulkActionButton,
	args: { icon: Check, label: "Mark read", onClick: fn() },
	decorators: [
		(Story) => (
			<div className="rounded-lg bg-inverse p-3 text-inverse-foreground">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof BulkActionButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithLabel: Story = {};
export const IconOnly: Story = { args: { showLabel: false } };
