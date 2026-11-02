import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "#/components/ui/button";
import {
	Popover,
	PopoverAnchor,
	PopoverContent,
	PopoverDescription,
	PopoverHeader,
	PopoverTitle,
	PopoverTrigger,
} from "#/components/ui/popover";

const meta = {
	title: "UI/Popover",
	parameters: { docs: { story: { inline: false, height: "480px" } } },
	component: Popover,
	args: { defaultOpen: false },
	render: (args) => (
		<Popover {...args}>
			<PopoverAnchor asChild>
				<span>
					<PopoverTrigger asChild>
						<Button variant="outline">Reading details</Button>
					</PopoverTrigger>
				</span>
			</PopoverAnchor>
			<PopoverContent aria-label="Reading details">
				<PopoverHeader>
					<PopoverTitle>Reading position</PopoverTitle>
					<PopoverDescription>
						42% complete. Your place is saved automatically.
					</PopoverDescription>
				</PopoverHeader>
			</PopoverContent>
		</Popover>
	),
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {};
export const Open: Story = { args: { defaultOpen: true } };
