import {
	BookOpen,
	DotsThreeVertical,
	Hash,
	House,
	Plus,
} from "@phosphor-icons/react";
import { BrandLogo } from "#/components/brand/brand-logo";
import {
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupAction,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarInput,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuBadge,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSkeleton,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	SidebarSeparator,
} from "#/components/ui/sidebar";

export function StorySidebarContent({
	loading = false,
}: {
	loading?: boolean;
}) {
	return (
		<>
			<SidebarHeader>
				<BrandLogo />
				<SidebarInput
					aria-label="Search library"
					placeholder="Search library…"
				/>
			</SidebarHeader>
			<SidebarSeparator />
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Your library</SidebarGroupLabel>
					<SidebarGroupAction aria-label="Save a link">
						<Plus />
					</SidebarGroupAction>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton isActive tooltip="Home">
									<House />
									<span>Home</span>
								</SidebarMenuButton>
								<SidebarMenuAction aria-label="Home actions">
									<DotsThreeVertical />
								</SidebarMenuAction>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton tooltip="Unread">
									<BookOpen />
									<span>Unread</span>
								</SidebarMenuButton>
								<SidebarMenuBadge>12</SidebarMenuBadge>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton tooltip="Tags">
									<Hash />
									<span>Tags</span>
								</SidebarMenuButton>
								<SidebarMenuSub>
									<SidebarMenuSubItem>
										<SidebarMenuSubButton href="#design" isActive>
											Design
										</SidebarMenuSubButton>
									</SidebarMenuSubItem>
									<SidebarMenuSubItem>
										<SidebarMenuSubButton href="#engineering">
											Engineering
										</SidebarMenuSubButton>
									</SidebarMenuSubItem>
								</SidebarMenuSub>
							</SidebarMenuItem>
							{loading && (
								<SidebarMenuItem>
									<SidebarMenuSkeleton showIcon />
								</SidebarMenuItem>
							)}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<p className="p-2 text-sm text-muted-foreground">Alex Reader</p>
			</SidebarFooter>
		</>
	);
}
