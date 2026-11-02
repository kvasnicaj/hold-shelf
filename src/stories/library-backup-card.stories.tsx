import type { Meta, StoryObj } from "@storybook/react-vite";
import { LibraryBackupCard } from "#/components/library/library-backup-card";

const meta = {
	title: "Settings/Library backup",
	component: LibraryBackupCard,
	tags: ["!autodocs"],
	decorators: [
		(Story) => (
			<div className="w-[min(48rem,calc(100vw-2rem))] space-y-4">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof LibraryBackupCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
