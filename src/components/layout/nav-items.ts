import {
	Archive,
	BookMarked,
	BookOpen,
	Home,
	type LucideIcon,
	Tags,
} from "lucide-react";

export type AppNavItem = {
	href: string;
	icon: LucideIcon;
	label: string;
};

export const homeNavItem: AppNavItem = {
	href: "/app/home",
	icon: Home,
	label: "Home",
};

export const libraryNavItems: AppNavItem[] = [
	{ href: "/app/articles", icon: BookOpen, label: "Unread" },
	{ href: "/app/favorites", icon: BookMarked, label: "Favorites" },
	{ href: "/app/archive", icon: Archive, label: "Library" },
	{ href: "/app/tags", icon: Tags, label: "Tags" },
];

export const desktopLibraryNavItems: AppNavItem[] = libraryNavItems.filter(
	(item) => item.href !== "/app/tags",
);

export const mobileNavItems: AppNavItem[] = [homeNavItem, ...libraryNavItems];
