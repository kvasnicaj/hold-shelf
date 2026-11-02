import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeChoice } from "#/components/theme/theme-choice";

const meta = {
	title: "Theme/Choice",
	component: ThemeChoice,
} satisfies Meta<typeof ThemeChoice>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
