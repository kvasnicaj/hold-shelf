import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor } from "storybook/test";
import { SearchPanel } from "#/components/search/search-panel";
import { searchForReading } from "#/stories/helpers";
import { getArticles } from "../../.storybook/mocks/api";

const meta = {
	title: "Search/Panel",
	component: SearchPanel,
	args: { onDone: fn(), onClose: fn() },
	tags: ["!autodocs"],
	decorators: [
		(Story) => (
			<div className="w-[min(36rem,calc(100vw-2rem))] overflow-hidden rounded-xl border bg-card">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof SearchPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ReadyToSearch: Story = {};
export const Results: Story = {
	play: async (context) => {
		await searchForReading(context);
		await expect(
			await context.canvas.findByRole("button", {
				name: /Making room/,
			}),
		).toBeVisible();
		await expect(
			context.canvas.getByRole("button", {
				name: "Show all matches in Library",
			}),
		).toBeEnabled();
	},
};
export const EmptyResults: Story = {
	parameters: { mockScenario: "empty" },
	play: async (context) => {
		await searchForReading(context);
		await expect(
			await context.canvas.findByText("No saved articles match “reading”."),
		).toBeVisible();
	},
};
export const LoadingResults: Story = {
	parameters: { mockScenario: "loading" },
	play: async (context) => {
		await searchForReading(context);
		await expect(await context.canvas.findByRole("status")).toHaveTextContent(
			"Searching…",
		);
		await expect(
			context.canvas.queryByText(/No saved articles match/),
		).not.toBeInTheDocument();
	},
};
export const FailedRequest: Story = {
	parameters: { mockScenario: "error" },
	play: async (context) => {
		await searchForReading(context);
		await expect(await context.canvas.findByRole("alert")).toHaveTextContent(
			"Search could not reach your library.",
		);
		const requests = getArticles.mock.calls.length;
		await userEvent.click(
			context.canvas.getByRole("button", { name: "Try again" }),
		);
		await waitFor(() =>
			expect(getArticles.mock.calls.length).toBeGreaterThan(requests),
		);
	},
};
