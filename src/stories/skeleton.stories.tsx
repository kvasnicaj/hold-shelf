import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton } from "#/components/ui/skeleton";

const meta = {
	title: "UI/Skeleton",
	component: Skeleton,
	args: { className: "h-5 w-64" },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {};
export const Avatar: Story = { args: { className: "size-10 rounded-full" } };
export const ArticleRow: Story = {
	render: () => (
		<div className="flex w-80 gap-3">
			<Skeleton className="size-10 shrink-0 rounded-md" />
			<div className="flex-1 space-y-2">
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-2/3" />
			</div>
		</div>
	),
};
