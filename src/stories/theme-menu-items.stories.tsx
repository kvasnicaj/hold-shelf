import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeMenuItems } from "#/components/theme/theme-menu-items";
import { Button } from "#/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";

const meta = {
	title: "Theme/Menu items",
	component: ThemeMenuItems,
	render: () => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">Open account menu</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<ThemeMenuItems />
			</DropdownMenuContent>
		</DropdownMenu>
	),
} satisfies Meta<typeof ThemeMenuItems>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
