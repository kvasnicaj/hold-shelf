import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "#/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/ui/tooltip";

const meta = {
	title: "UI/Tooltip",
	parameters: { docs: { story: { inline: false, height: "480px" } } },
	component: Tooltip,
	args: { defaultOpen: false },
	render: (args) => (
		<Tooltip {...args}>
			<TooltipTrigger asChild>
				<Button variant="outline">Save a link</Button>
			</TooltipTrigger>
			<TooltipContent>Save a link (S)</TooltipContent>
		</Tooltip>
	),
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OnHover: Story = {};
export const Open: Story = { args: { defaultOpen: true } };
