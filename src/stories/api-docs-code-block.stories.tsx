import type { Meta, StoryObj } from "@storybook/react-vite";
import { ApiDocsCodeBlock } from "#/components/api-docs/api-docs-code-block";

const meta = {
	title: "Documentation/Code block",
	component: ApiDocsCodeBlock,
	args: {
		label: "Example response",
		code: JSON.stringify(
			{ items: [{ id: "article-1", title: "A good read" }], total: 1 },
			null,
			2,
		),
	},
	decorators: [
		(Story) => (
			<div className="w-[min(48rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof ApiDocsCodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
