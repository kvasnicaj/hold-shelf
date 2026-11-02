import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ActionsMenu } from "#/components/layout/actions-menu";
import { DropdownMenuItem } from "#/components/ui/dropdown-menu";
import { sampleArticle } from "#/stories/fixtures";
import { articleActions } from "#/stories/helpers";

const meta = {
	title: "Layout/Actions menu",
	component: ActionsMenu,
	args: {
		label: "Article actions",
		children: (
			<>
				<DropdownMenuItem onSelect={fn()}>Mark as read</DropdownMenuItem>
				<DropdownMenuItem onSelect={fn()}>Add to favorites</DropdownMenuItem>
			</>
		),
		footer: <DropdownMenuItem onSelect={fn()}>Move to Trash</DropdownMenuItem>,
	},
} satisfies Meta<typeof ActionsMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithTagPicker: Story = {
	args: {
		tagPicker: {
			...articleActions,
			selectedTagIds: ["design"],
			articleIds: [sampleArticle.id],
		},
	},
};
