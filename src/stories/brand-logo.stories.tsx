import type { Meta, StoryObj } from "@storybook/react-vite";
import { BrandLogo } from "#/components/brand/brand-logo";

const meta = {
	title: "Brand/Logo",
	component: BrandLogo,
	argTypes: {
		variant: {
			control: "select",
			options: ["horizontal", "stacked", "symbol", "wordmark"],
		},
	},
} satisfies Meta<typeof BrandLogo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {};
export const Stacked: Story = { args: { variant: "stacked" } };
export const SymbolMark: Story = { args: { variant: "symbol" } };
export const CompactSymbol: Story = {
	args: { variant: "symbol", compact: true },
};
export const Wordmark: Story = { args: { variant: "wordmark" } };
