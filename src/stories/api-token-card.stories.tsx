import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor } from "storybook/test";
import { ApiTokenCard } from "#/components/settings/api-token-card";

const meta = {
	title: "Settings/API token",
	component: ApiTokenCard,
	tags: ["!autodocs"],
	decorators: [
		(Story) => (
			<div className="w-[min(48rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof ApiTokenCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvas }) => {
		const generate = canvas.getByRole("button", { name: "Generate token" });
		await waitFor(() => expect(generate).toBeEnabled());
		await userEvent.click(generate);
		await expect(
			await canvas.findByRole("textbox", { name: "New API token" }),
		).toHaveValue("hs_storybook_synthetic_example_only");
		await expect(canvas.getByText("Personal token enabled")).toBeVisible();
		await userEvent.click(canvas.getByRole("button", { name: "Revoke" }));
		await expect(await canvas.findByText("No personal token")).toBeVisible();
		await expect(
			canvas.queryByRole("textbox", { name: "New API token" }),
		).not.toBeInTheDocument();
	},
};
export const ExistingToken: Story = { parameters: { mockScenario: "token" } };
export const Loading: Story = { parameters: { mockScenario: "loading" } };
export const Failure: Story = { parameters: { mockScenario: "error" } };
