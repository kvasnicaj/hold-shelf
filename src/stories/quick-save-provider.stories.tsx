import type { Meta, StoryObj } from "@storybook/react-vite";
import { QuickSaveProvider } from "#/components/quick-save/quick-save-provider";
import { StoryProviderDemo } from "#/stories/story-provider-demo";

const meta = {
	title: "Save/Provider",
	component: QuickSaveProvider,
	args: { children: null },
	parameters: { layout: "fullscreen", appShell: true },
	tags: ["!autodocs"],
	render: () => <StoryProviderDemo action="save" />,
} satisfies Meta<typeof QuickSaveProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
