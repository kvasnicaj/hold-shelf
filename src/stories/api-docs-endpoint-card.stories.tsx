import type { Meta, StoryObj } from "@storybook/react-vite";
import { ApiDocsEndpointCard } from "#/components/api-docs/api-docs-endpoint-card";

const meta = {
	title: "Documentation/Endpoint",
	component: ApiDocsEndpointCard,
	args: {
		endpoint: {
			method: "GET",
			path: "/api/v1/articles",
			summary: "List saved articles",
			auth: "Personal access token",
			parameters: [
				{
					name: "q",
					type: "string",
					description: "Search your saved articles.",
				},
			],
			responses: [
				{
					status: "200",
					description: "Articles returned successfully",
					body: '{ "items": [], "total": 0 }',
				},
			],
			exampleRequest: "curl https://hold-shelf.com/api/v1/articles",
			exampleResponse: '{ "items": [], "total": 0 }',
			notes: ["Results are paginated."],
		},
	},
	decorators: [
		(Story) => (
			<div className="w-[min(48rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof ApiDocsEndpointCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
