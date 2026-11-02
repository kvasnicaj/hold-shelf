import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { Button } from "#/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";

const meta = {
	title: "UI/Dropdown Menu",
	parameters: { docs: { story: { inline: false, height: "480px" } } },
	component: DropdownMenu,
	args: { defaultOpen: false },
	render: (args) => (
		<DropdownMenu {...args}>
			<DropdownMenuTrigger asChild>
				<Button variant="outline">Article actions</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuLabel>Reading list</DropdownMenuLabel>
				<DropdownMenuGroup>
					<DropdownMenuItem>
						Save a link<DropdownMenuShortcut>S</DropdownMenuShortcut>
					</DropdownMenuItem>
					<DropdownMenuCheckboxItem checked>Favorite</DropdownMenuCheckboxItem>
					<DropdownMenuItem disabled>Refresh unavailable</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuRadioGroup value="unread">
					<DropdownMenuRadioItem value="unread">Unread</DropdownMenuRadioItem>
					<DropdownMenuRadioItem value="read">Read</DropdownMenuRadioItem>
				</DropdownMenuRadioGroup>
				<DropdownMenuSub>
					<DropdownMenuSubTrigger>Move to shelf</DropdownMenuSubTrigger>
					<DropdownMenuSubContent>
						<DropdownMenuItem>Weekend reads</DropdownMenuItem>
						<DropdownMenuItem>Research</DropdownMenuItem>
					</DropdownMenuSubContent>
				</DropdownMenuSub>
				<DropdownMenuSeparator />
				<DropdownMenuItem variant="destructive">
					Delete forever
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	),
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {};
export const Open: Story = {
	// Keep the surrounding controls available while inspecting the open example.
	args: { modal: false },
	play: async ({ canvas, canvasElement }) => {
		await userEvent.click(
			canvas.getByRole("button", { name: "Article actions" }),
		);
		const menu = await within(canvasElement.ownerDocument.body).findByRole(
			"menu",
		);
		await expect(
			within(menu).getByRole("menuitemcheckbox", { name: "Favorite" }),
		).toBeChecked();
		await waitFor(() =>
			expect(menu.contains(canvasElement.ownerDocument.activeElement)).toBe(
				true,
			),
		);
	},
};
export const KeyboardNavigation: Story = {
	play: async ({ canvas, canvasElement }) => {
		const trigger = canvas.getByRole("button", { name: "Article actions" });
		const body = within(canvasElement.ownerDocument.body);
		await userEvent.tab();
		await expect(trigger).toHaveFocus();
		await userEvent.keyboard("{Enter}");
		const menu = within(await body.findByRole("menu"));
		await waitFor(() =>
			expect(menu.getByRole("menuitem", { name: /Save a link/ })).toHaveFocus(),
		);
		await userEvent.keyboard("{ArrowDown}");
		await expect(
			menu.getByRole("menuitemcheckbox", { name: "Favorite" }),
		).toHaveFocus();
		await userEvent.keyboard("{Escape}");
		await waitFor(() =>
			expect(body.queryByRole("menu")).not.toBeInTheDocument(),
		);
		await waitFor(() => expect(trigger).toHaveFocus());
	},
};
