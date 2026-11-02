import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor } from "storybook/test";
import { TagChip } from "#/components/tags/tag-chip";
import { useStoryState } from "#/stories/use-story-state";

const meta = {
	title: "Tags/Tag chip",
	component: TagChip,
	args: { children: "Design", count: 12, isActive: false, onClick: fn() },
	render: function Render(initialArgs) {
		const [args, updateArgs] = useStoryState(initialArgs);
		return (
			<TagChip
				{...args}
				onClick={() => {
					args.onClick();
					updateArgs({ isActive: !args.isActive });
				}}
			/>
		);
	},
} satisfies Meta<typeof TagChip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	play: async ({ canvas }) => {
		const chip = canvas.getByRole("button", { name: /Design/ });
		await expect(chip).toHaveAttribute("aria-pressed", "false");
		await userEvent.click(chip);
		await waitFor(() => expect(chip).toHaveAttribute("aria-pressed", "true"));
		await userEvent.keyboard("{Enter}");
		await waitFor(() => expect(chip).toHaveAttribute("aria-pressed", "false"));
	},
};
export const Active: Story = { args: { isActive: true } };
export const WithoutCount: Story = { args: { count: undefined } };
