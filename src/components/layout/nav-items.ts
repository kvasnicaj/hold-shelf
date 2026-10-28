import {
	Bookmark,
	BookOpen,
	House,
	Library,
	type LucideIcon,
} from "lucide-react";

export type AppNavItem = {
	href: string;
	icon: LucideIcon;
	label: string;
};

export const unreadNavHref = "/app/articles";

// Shared by the desktop sidebar and the mobile bottom bar. Tags live in the
// sidebar on desktop and inside Library on mobile.
export const primaryNavItems: AppNavItem[] = [
	{ href: "/app/home", icon: House, label: "Home" },
	{ href: unreadNavHref, icon: BookOpen, label: "Unread" },
	{ href: "/app/favorites", icon: Bookmark, label: "Favorites" },
	{ href: "/app/archive", icon: Library, label: "Library" },
];
