import type { Meta, StoryObj } from "@storybook/react-vite";
import { CookiePreferencesButton } from "#/components/privacy/cookie-preferences-button";

const meta = {
	title: "Public/Cookie preferences",
	component: CookiePreferencesButton,
	tags: ["!autodocs"],
} satisfies Meta<typeof CookiePreferencesButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
