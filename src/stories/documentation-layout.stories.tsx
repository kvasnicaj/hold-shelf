import type { Meta, StoryObj } from "@storybook/react-vite";
import { DocumentationLayout } from "#/components/documentation/documentation-layout";
import { DocumentationSection } from "#/components/documentation/documentation-section";

const meta = {
	title: "Documentation/Layout",
	component: DocumentationLayout,
	args: {
		kind: "api",
		title: "Build on your reading library",
		description: "Browse and manage your saved articles from your own tools.",
		children: (
			<DocumentationSection title="Getting started">
				<p className="text-sm">
					Create a personal access token in Settings to connect your own tools.
				</p>
			</DocumentationSection>
		),
	},
	parameters: { layout: "fullscreen" },
	tags: ["!autodocs"],
} satisfies Meta<typeof DocumentationLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Api: Story = {};
export const Cli: Story = { args: { kind: "cli" } };
