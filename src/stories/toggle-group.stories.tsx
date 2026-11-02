import type { Meta, StoryObj } from "@storybook/react-vite";
import { ToggleGroup, ToggleGroupItem } from "#/components/ui/toggle-group";

const meta = {
	title: "UI/Toggle Group",
	component: ToggleGroup,
	args: {
		type: "single",
		defaultValue: "unread",
		"aria-label": "Reading status",
	},
	render: (args) => (
		<ToggleGroup {...args}>
			<ToggleGroupItem value="all">All</ToggleGroupItem>
			<ToggleGroupItem value="unread">Unread</ToggleGroupItem>
			<ToggleGroupItem value="read">Read</ToggleGroupItem>
		</ToggleGroup>
	),
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {};
export const Multiple: Story = {
	args: { type: "multiple", defaultValue: ["unread", "read"] },
};
export const Disabled: Story = { args: { disabled: true } };
