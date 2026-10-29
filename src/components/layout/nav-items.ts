import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { BookmarkSimple, BookOpen, Books, House } from "@phosphor-icons/react";

export type AppNavItem = {
	href: string;
	icon: PhosphorIcon;
	label: string;
	/** Pressed after G to jump here, e.g. G then H for Home. */
	shortcutKey: string;
};

export const unreadNavHref = "/app/articles";

// Shared by the desktop sidebar and the mobile bottom bar. Tags live in the
// sidebar on desktop and inside Library on mobile.
export const primaryNavItems: AppNavItem[] = [
	{ href: "/app/home", icon: House, label: "Home", shortcutKey: "h" },
	{ href: unreadNavHref, icon: BookOpen, label: "Unread", shortcutKey: "u" },
	{
		href: "/app/favorites",
		icon: BookmarkSimple,
		label: "Favorites",
		shortcutKey: "f",
	},
	{ href: "/app/archive", icon: Books, label: "Library", shortcutKey: "l" },
];
