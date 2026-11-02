import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArticleReaderProvider } from "#/components/article-reader/article-reader-provider";
import { StoryProviderDemo } from "#/stories/story-provider-demo";

const meta = {
	title: "Reader/Provider",
	component: ArticleReaderProvider,
	args: { children: null },
	parameters: { layout: "fullscreen", appShell: true },
	tags: ["!autodocs"],
	render: () => <StoryProviderDemo action="reader" />,
} satisfies Meta<typeof ArticleReaderProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
