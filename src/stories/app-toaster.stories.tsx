import type { Meta, StoryObj } from "@storybook/react-vite";
import { toast } from "sonner";
import { fn } from "storybook/test";
import { AppToaster } from "#/components/layout/app-toaster";
import { Button } from "#/components/ui/button";

const meta = {
	title: "Layout/Toasts",
	component: AppToaster,
	tags: ["!autodocs"],
	render: () => (
		<div className="flex flex-wrap gap-3">
			<Button
				onClick={() =>
					toast.success("Saved to Unread", {
						action: { label: "Read now", onClick: fn() },
					})
				}
			>
				Show saved toast
			</Button>
			<Button
				variant="outline"
				onClick={() =>
					toast.error("Could not save this article. Please try again.")
				}
			>
				Show error toast
			</Button>
			<Button
				variant="outline"
				onClick={() =>
					toast("Article moved to Trash", {
						action: { label: "Undo", onClick: fn() },
					})
				}
			>
				Show undo toast
			</Button>
		</div>
	),
} satisfies Meta<typeof AppToaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
