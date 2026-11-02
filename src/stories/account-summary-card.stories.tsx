import type { Meta, StoryObj } from "@storybook/react-vite";
import { AccountSummaryCard } from "#/components/settings/account-summary-card";

const meta = {
	title: "Settings/Account",
	component: AccountSummaryCard,
	tags: ["!autodocs"],
	decorators: [
		(Story) => (
			<div className="w-[min(48rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof AccountSummaryCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const SignedOut: Story = { parameters: { mockScenario: "signed-out" } };
