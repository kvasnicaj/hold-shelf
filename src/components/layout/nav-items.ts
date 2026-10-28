import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { BookmarkSimple, BookOpen, Books, House } from "@phosphor-icons/react";

export type AppNavItem = {
	href: string;
	icon: PhosphorIcon;
	label: string;
};

export const unreadNavHref = "/app/articles";

// Shared by the desktop sidebar and the mobile bottom bar. Tags live in the
// sidebar on desktop and inside Library on mobile.
export const primaryNavItems: AppNavItem[] = [
	{ href: "/app/home", icon: House, label: "Home" },
	{ href: unreadNavHref, icon: BookOpen, label: "Unread" },
	{ href: "/app/favorites", icon: BookmarkSimple, label: "Favorites" },
	{ href: "/app/archive", icon: Books, label: "Library" },
];
