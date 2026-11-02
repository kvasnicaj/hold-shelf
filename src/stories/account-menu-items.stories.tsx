import type { Meta, StoryObj } from "@storybook/react-vite";
import { AccountMenuItems } from "#/components/layout/account-menu-items";
import { Button } from "#/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";

const meta = {
	title: "Layout/Account menu items",
	component: AccountMenuItems,
	render: () => (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">Open account menu</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<AccountMenuItems />
			</DropdownMenuContent>
		</DropdownMenu>
	),
} satisfies Meta<typeof AccountMenuItems>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
