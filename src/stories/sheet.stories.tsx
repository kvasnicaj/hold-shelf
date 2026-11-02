import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "#/components/ui/button";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "#/components/ui/sheet";

const meta = {
	title: "UI/Sheet",
	parameters: { docs: { story: { inline: false, height: "480px" } } },
	component: Sheet,
	args: { defaultOpen: false },
	render: (args) => (
		<Sheet {...args}>
			<SheetTrigger asChild>
				<Button variant="outline">Open sheet</Button>
			</SheetTrigger>
			<SheetContent>
				<SheetHeader>
					<SheetTitle>Your reading list</SheetTitle>
					<SheetDescription>
						Everything you have saved for later.
					</SheetDescription>
				</SheetHeader>
				<p className="px-4 text-sm">Choose an article from your shelf.</p>
				<SheetFooter>
					<SheetClose asChild>
						<Button>Done</Button>
					</SheetClose>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	),
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Right: Story = {};
export const Open: Story = { args: { defaultOpen: true } };
export const Bottom: Story = {
	render: (args) => (
		<Sheet {...args} defaultOpen>
			<SheetTrigger asChild>
				<Button>Open bottom sheet</Button>
			</SheetTrigger>
			<SheetContent side="bottom">
				<SheetHeader>
					<SheetTitle>Save a link</SheetTitle>
					<SheetDescription>Paste a URL to save it to Unread.</SheetDescription>
				</SheetHeader>
				<SheetFooter>
					<SheetClose asChild>
						<Button>Done</Button>
					</SheetClose>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	),
};
