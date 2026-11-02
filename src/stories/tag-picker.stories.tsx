import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { TagPicker } from "#/components/tags/tag-picker";
import { sampleArticle, sampleTags } from "#/stories/fixtures";
import { articleActions } from "#/stories/helpers";

const meta = {
	title: "Tags/Picker",
	component: TagPicker,
	args: {
		availableTags: sampleTags,
		selectedTagIds: ["design"],
		articleIds: [sampleArticle.id],
		onAddTag: fn(async () => {}),
		onRemoveTag: fn(async () => {}),
		onCreateTag: articleActions.onCreateTag,
	},
} satisfies Meta<typeof TagPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvas, canvasElement, args }) => {
		await userEvent.click(canvas.getByRole("button", { name: "Manage tags" }));
		const picker = within(
			await within(canvasElement.ownerDocument.body).findByRole("dialog", {
				name: "Article tags",
			}),
		);
		const design = picker.getByRole("checkbox", {
			name: "Design",
		});
		await expect(design).toBeChecked();
		await userEvent.click(design);
		await expect(design).not.toBeChecked();
		await expect(args.onRemoveTag).toHaveBeenCalledWith("design", [
			sampleArticle.id,
		]);
		const engineering = picker.getByRole("checkbox", { name: "Engineering" });
		await userEvent.click(engineering);
		await expect(engineering).toBeChecked();
		await expect(args.onAddTag).toHaveBeenCalledWith("engineering", [
			sampleArticle.id,
		]);
	},
};
export const Empty: Story = { args: { availableTags: [], selectedTagIds: [] } };
export const ExistingTagsOnly: Story = {
	args: { onCreateTag: undefined },
	play: async ({ canvas, canvasElement }) => {
		await userEvent.click(canvas.getByRole("button", { name: "Manage tags" }));
		const picker = within(
			await within(canvasElement.ownerDocument.body).findByRole("dialog", {
				name: "Article tags",
			}),
		);
		await userEvent.type(
			picker.getByRole("textbox", { name: "Search tags" }),
			"Missing tag",
		);
		await expect(picker.getByText("No tags match.")).toBeVisible();
		await expect(
			picker.queryByRole("button", { name: /Create/ }),
		).not.toBeInTheDocument();
	},
};
export const ErrorOnUpdate: Story = {
	args: {
		onAddTag: fn(async () => {
			throw new Error("Could not update the tag.");
		}),
	},
	play: async ({ canvas, canvasElement }) => {
		await userEvent.click(canvas.getByRole("button", { name: "Manage tags" }));
		const picker = within(
			await within(canvasElement.ownerDocument.body).findByRole("dialog", {
				name: "Article tags",
			}),
		);
		const engineering = picker.getByRole("checkbox", { name: "Engineering" });
		await userEvent.click(engineering);
		await expect(await picker.findByRole("alert")).toHaveTextContent(
			"Could not update the tag.",
		);
		await expect(engineering).not.toBeChecked();
		await expect(engineering).toBeEnabled();
	},
};
export const CreateAndAssign: Story = {
	play: async ({ canvas, canvasElement, args }) => {
		await userEvent.click(canvas.getByRole("button", { name: "Manage tags" }));
		const picker = within(
			await within(canvasElement.ownerDocument.body).findByRole("dialog", {
				name: "Article tags",
			}),
		);
		await userEvent.type(
			picker.getByRole("textbox", { name: "Search or create tag" }),
			"Research",
		);
		await userEvent.click(
			picker.getByRole("button", { name: 'Create "Research"' }),
		);
		await expect(
			await picker.findByRole("checkbox", { name: "Research" }),
		).toBeChecked();
		await expect(args.onCreateTag).toHaveBeenCalledWith("Research");
		await expect(args.onAddTag).toHaveBeenCalledWith("demo-Research", [
			sampleArticle.id,
		]);
	},
};
