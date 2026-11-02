import type { Meta, StoryObj } from "@storybook/react-vite";
import { DocumentationSection } from "#/components/documentation/documentation-section";

const meta = {
	title: "Documentation/Section",
	component: DocumentationSection,
	args: {
		title: "Authentication",
		description: "Use a personal access token to access your library.",
		children: (
			<p className="text-sm">Create and revoke your token in Settings.</p>
		),
	},
	decorators: [
		(Story) => (
			<div className="w-[min(48rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof DocumentationSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
