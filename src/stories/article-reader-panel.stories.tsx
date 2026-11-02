import type { Meta, StoryObj } from "@storybook/react-vite";
import { ArticleReaderPanel } from "#/components/article-reader/article-reader-panel";

const meta = {
	title: "Reader/Panel",
	component: ArticleReaderPanel,
	parameters: {
		layout: "fullscreen",
		routePath: "/app/home#article=article-1",
	},
	tags: ["!autodocs"],
} satisfies Meta<typeof ArticleReaderPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ready: Story = {};
export const Unavailable: Story = {
	parameters: { mockScenario: "unavailable" },
};
export const Loading: Story = { parameters: { mockScenario: "loading" } };
export const Failure: Story = { parameters: { mockScenario: "error" } };
export const Phone: Story = {
	globals: { viewport: { value: "phone", isRotated: false } },
};
