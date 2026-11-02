import type { Meta, StoryObj } from "@storybook/react-vite";
import { SearchProvider } from "#/components/search/search-provider";
import { StoryProviderDemo } from "#/stories/story-provider-demo";

const meta = {
	title: "Search/Provider",
	component: SearchProvider,
	args: { children: null },
	parameters: { layout: "fullscreen", appShell: true },
	tags: ["!autodocs"],
	render: () => <StoryProviderDemo action="search" />,
} satisfies Meta<typeof SearchProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
