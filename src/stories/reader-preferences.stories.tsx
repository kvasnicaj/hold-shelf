import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { ReaderPreferences } from "#/components/article-reader/reader-preferences";
import { sampleSettings } from "#/stories/fixtures";
import { useStoryState } from "#/stories/use-story-state";

const meta = {
	title: "Reader/Preferences",
	component: ReaderPreferences,
	args: { settings: sampleSettings, onChange: fn() },
	render: function Render(initialArgs) {
		const [args, updateArgs] = useStoryState(initialArgs);
		return (
			<ReaderPreferences
				{...args}
				onChange={(partial) => {
					args.onChange(partial);
					updateArgs({ settings: { ...args.settings, ...partial } });
				}}
			/>
		);
	},
} satisfies Meta<typeof ReaderPreferences>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvas, canvasElement, args }) => {
		await userEvent.click(
			canvas.getByRole("button", { name: "Reading settings" }),
		);
		const settings = within(
			await within(canvasElement.ownerDocument.body).findByRole("dialog", {
				name: "Reading settings",
			}),
		);
		await userEvent.click(
			settings.getByRole("button", { name: "Larger text" }),
		);
		await waitFor(() => expect(settings.getByText("20 px")).toBeVisible());
		await expect(args.onChange).toHaveBeenCalledWith({ fontSize: 20 });
		await userEvent.click(settings.getByRole("radio", { name: "Wide" }));
		await expect(settings.getByRole("radio", { name: "Wide" })).toBeChecked();
		await userEvent.click(settings.getByRole("radio", { name: "Sans" }));
		await expect(settings.getByRole("radio", { name: "Sans" })).toBeChecked();
	},
};
export const LargeSans: Story = {
	args: { settings: { fontSize: 24, width: "wide", font: "sans" } },
	play: async ({ canvas, canvasElement }) => {
		await userEvent.click(
			canvas.getByRole("button", { name: "Reading settings" }),
		);
		const settings = within(
			await within(canvasElement.ownerDocument.body).findByRole("dialog", {
				name: "Reading settings",
			}),
		);
		await expect(
			settings.getByRole("button", { name: "Larger text" }),
		).toBeDisabled();
		await userEvent.click(
			settings.getByRole("button", { name: "Smaller text" }),
		);
		await waitFor(() => expect(settings.getByText("23 px")).toBeVisible());
		await expect(
			settings.getByRole("button", { name: "Larger text" }),
		).toBeEnabled();
	},
};
