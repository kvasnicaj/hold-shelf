import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { AppLayout } from "#/components/layout/app-layout";

const meta = {
	title: "Layout/App shell",
	component: AppLayout,
	parameters: { layout: "fullscreen", routePath: "/app/home", appShell: true },
	tags: ["!autodocs"],
} satisfies Meta<typeof AppLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Home: Story = {};
export const Library: Story = { parameters: { routePath: "/app/archive" } };
export const Reading: Story = {
	parameters: { routePath: "/app/home#article=article-1" },
};
export const Phone: Story = {
	globals: { viewport: { value: "phone", isRotated: false } },
};
export const SaveAndReadWithKeyboard: Story = {
	play: async ({ canvas, canvasElement, step }) => {
		const body = within(canvasElement.ownerDocument.body);
		await canvas.findByRole("heading", { name: "Make time for a good read" });
		await step("Save a link using the keyboard shortcut", async () => {
			await userEvent.keyboard("s");
			const save = within(
				await body.findByRole("dialog", { name: "Save a link" }),
			);
			await userEvent.type(
				save.getByLabelText("Link"),
				"https://example.com/from-keyboard",
			);
			await userEvent.keyboard("{Shift>}{Enter}{/Shift}");
		});
		await step(
			"Read the saved article and return to the updated shelf",
			async () => {
				const reader = within(
					await body.findByRole("dialog", { name: "Article reader" }),
				);
				await expect(
					await reader.findByRole("heading", {
						name: "Your saved demo article",
					}),
				).toBeVisible();
				await userEvent.click(
					reader.getByRole("button", { name: "Close reader" }),
				);
				await waitFor(() =>
					expect(
						body.queryByRole("dialog", { name: "Article reader" }),
					).not.toBeInTheDocument(),
				);
				await expect(
					await canvas.findByText("3 articles are waiting for you."),
				).toBeVisible();
				const savedLinks = await canvas.findAllByRole("link", {
					name: "Your saved demo article",
				});
				await expect(savedLinks[0]).toBeVisible();
			},
		);
	},
};
export const PhoneSaveFlow: Story = {
	globals: { viewport: { value: "phone", isRotated: false } },
	play: async ({ canvas, canvasElement, step }) => {
		const body = within(canvasElement.ownerDocument.body);
		await canvas.findByRole("heading", { name: "Make time for a good read" });
		await step("Save from the phone navigation", async () => {
			await userEvent.click(
				canvas.getByRole("button", { name: "Save a link" }),
			);
			const save = within(
				await body.findByRole("dialog", { name: "Save a link" }),
			);
			await userEvent.type(
				save.getByLabelText("Link"),
				"https://example.com/from-phone",
			);
			await userEvent.click(save.getByRole("button", { name: "Save" }));
			await waitFor(() =>
				expect(body.getByText("Saved to Unread")).toBeVisible(),
			);
			await expect(
				await canvas.findByText("3 articles are waiting for you."),
			).toBeVisible();
		});
		await step("Open the saved article from the confirmation", async () => {
			await userEvent.click(body.getByRole("button", { name: "Read now" }));
			const reader = within(
				await body.findByRole("dialog", { name: "Article reader" }),
			);
			await expect(
				await reader.findByRole("heading", { name: "Your saved demo article" }),
			).toBeVisible();
		});
	},
};
