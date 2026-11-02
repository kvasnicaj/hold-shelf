import type { Meta, StoryObj } from "@storybook/react-vite";
import { DeleteAccountCard } from "#/components/settings/delete-account-card";

const meta = {
	title: "Settings/Delete account",
	component: DeleteAccountCard,
	tags: ["!autodocs"],
	decorators: [
		(Story) => (
			<div className="w-[min(48rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof DeleteAccountCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
