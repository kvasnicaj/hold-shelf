import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor } from "storybook/test";
import { AppPagination } from "#/components/pagination/app-pagination";
import { useStoryState } from "#/stories/use-story-state";

const meta = {
	title: "Layout/App pagination",
	component: AppPagination,
	args: { page: 1, totalPages: 12, onPageChange: fn() },
	render: function Render(initialArgs) {
		const [args, updateArgs] = useStoryState(initialArgs);
		return (
			<AppPagination
				{...args}
				onPageChange={(page) => {
					args.onPageChange(page);
					updateArgs({ page });
				}}
			/>
		);
	},
} satisfies Meta<typeof AppPagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstPage: Story = {
	play: async ({ canvas, args }) => {
		await userEvent.click(
			canvas.getByRole("link", { name: "Go to next page" }),
		);
		await expect(args.onPageChange).toHaveBeenCalledWith(2);
		await waitFor(() =>
			expect(
				canvas.getByRole("link", { name: "Go to page 2" }),
			).toHaveAttribute("aria-current", "page"),
		);
		await userEvent.click(canvas.getByRole("link", { name: "Go to page 12" }));
		await expect(args.onPageChange).toHaveBeenCalledWith(12);
		await waitFor(() =>
			expect(canvas.getByLabelText("Go to next page")).toHaveAttribute(
				"aria-disabled",
				"true",
			),
		);
		await expect(canvas.getByLabelText("Go to next page")).toHaveAttribute(
			"tabindex",
			"-1",
		);
	},
};
export const Middle: Story = { args: { page: 6 } };
export const LastPage: Story = { args: { page: 12 } };
export const FewPages: Story = { args: { totalPages: 3 } };
export const SinglePage: Story = { args: { totalPages: 1 } };
