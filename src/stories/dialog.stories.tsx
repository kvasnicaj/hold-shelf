import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "#/components/ui/dialog";

const meta = {
	title: "UI/Dialog",
	parameters: { docs: { story: { inline: false, height: "480px" } } },
	component: Dialog,
	args: { defaultOpen: false },
	render: (args) => (
		<Dialog {...args}>
			<DialogTrigger asChild>
				<Button variant="outline">Open dialog</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Save this article?</DialogTitle>
					<DialogDescription>
						The article will be added to your Unread shelf.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Cancel</Button>
					</DialogClose>
					<DialogClose asChild>
						<Button>Save article</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	),
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {};
export const Open: Story = { args: { defaultOpen: true } };
