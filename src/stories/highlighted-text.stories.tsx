import type { Meta, StoryObj } from "@storybook/react-vite";
import { HighlightedText } from "#/components/search/highlighted-text";

const meta = {
	title: "Search/Highlighted text",
	component: HighlightedText,
	args: {
		text: "A reading list for your next quiet afternoon",
		query: "reading",
	},
} satisfies Meta<typeof HighlightedText>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Match: Story = {};
export const NoMatch: Story = { args: { query: "absent" } };
export const CaseInsensitive: Story = { args: { query: "READING" } };
