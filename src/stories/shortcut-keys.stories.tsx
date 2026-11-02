import type { Meta, StoryObj } from "@storybook/react-vite";
import { ShortcutKeys } from "#/components/shortcuts/shortcut-keys";

const meta = {
	title: "Shortcuts/Keys",
	component: ShortcutKeys,
	args: { keys: ["G", "H"] },
} satisfies Meta<typeof ShortcutKeys>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Sequence: Story = {};
export const Single: Story = { args: { keys: ["S"] } };
export const QuestionMark: Story = { args: { keys: ["?"] } };
