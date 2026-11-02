import type { Meta, StoryObj } from "@storybook/react-vite";
import { ApiDocsFieldList } from "#/components/api-docs/api-docs-field-list";

const meta = {
	title: "Documentation/Fields",
	component: ApiDocsFieldList,
	args: {
		title: "Query parameters",
		fields: [
			{
				name: "q",
				type: "string",
				description: "Search article titles and saved text.",
			},
			{
				name: "page",
				type: "number",
				required: true,
				description: "The page of results to return.",
			},
		],
	},
	decorators: [
		(Story) => (
			<div className="w-[min(48rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof ApiDocsFieldList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Populated: Story = {};
export const Empty: Story = { args: { fields: [] } };
