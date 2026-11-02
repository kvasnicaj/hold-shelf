import type { Meta, StoryObj } from "@storybook/react-vite";
import { ShortcutsProvider } from "#/components/shortcuts/shortcuts-provider";
import { StoryProviderDemo } from "#/stories/story-provider-demo";

const meta = {
	title: "Shortcuts/Provider",
	component: ShortcutsProvider,
	args: { children: null },
	parameters: { layout: "fullscreen", appShell: true },
	tags: ["!autodocs"],
	render: () => <StoryProviderDemo action="shortcuts" />,
} satisfies Meta<typeof ShortcutsProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
