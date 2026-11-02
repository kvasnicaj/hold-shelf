import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { TrashPage } from "#/components/library/trash-page";
import { sampleTrash } from "#/stories/fixtures";
import {
	permanentlyDeleteTrash,
	restoreArticles,
} from "../../.storybook/mocks/api";

const meta = {
	title: "Pages/Trash",
	component: TrashPage,
	parameters: { layout: "fullscreen", routePath: "/app/trash" },
	tags: ["!autodocs"],
	decorators: [
		(Story) => (
			<div className="mx-auto w-full max-w-6xl p-4 sm:p-8">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof TrashPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = { parameters: { mockScenario: "empty" } };
export const Loading: Story = { parameters: { mockScenario: "loading" } };
export const Failure: Story = { parameters: { mockScenario: "error" } };
export const Phone: Story = {
	globals: { viewport: { value: "phone", isRotated: false } },
};
export const RestoreArticle: Story = {
	play: async ({ canvas }) => {
		const title = sampleTrash[0].title ?? sampleTrash[0].url;
		const row = (await canvas.findByText(title)).closest("li");
		if (!row) throw new Error("The trashed article must be in a list row.");
		await userEvent.click(within(row).getByRole("button", { name: "Restore" }));
		await waitFor(() =>
			expect(canvas.queryByText(title)).not.toBeInTheDocument(),
		);
		await expect(restoreArticles).toHaveBeenCalledWith({
			data: { ids: [sampleTrash[0].id] },
		});
		await expect(permanentlyDeleteTrash).not.toHaveBeenCalled();
	},
};
export const ConfirmPermanentDeletion: Story = {
	play: async ({ canvas, canvasElement }) => {
		const title = sampleTrash[0].title ?? sampleTrash[0].url;
		const trigger = await canvas.findByRole("button", {
			name: `Delete forever: ${title}`,
		});
		const body = within(canvasElement.ownerDocument.body);
		await userEvent.click(trigger);
		const dialog = within(
			await body.findByRole("dialog", {
				name: "Permanently delete this article?",
			}),
		);
		await waitFor(() =>
			expect(dialog.getByRole("button", { name: "Cancel" })).toHaveFocus(),
		);
		await userEvent.click(dialog.getByRole("button", { name: "Cancel" }));
		await expect(permanentlyDeleteTrash).not.toHaveBeenCalled();
		await waitFor(() => expect(trigger).toHaveFocus());
		await userEvent.click(trigger);
		await userEvent.click(
			within(await body.findByRole("dialog")).getByRole("button", {
				name: "Permanently delete",
			}),
		);
		await waitFor(() =>
			expect(canvas.queryByText(title)).not.toBeInTheDocument(),
		);
		await expect(permanentlyDeleteTrash).toHaveBeenCalledWith({
			data: { mode: "selected", ids: [sampleTrash[0].id] },
		});
	},
};
