import { primaryNavItems } from "#/components/layout/nav-items";
import type {
	ShortcutAction,
	ShortcutDescription,
} from "#/components/shortcuts/types";

export const NAVIGATION_PREFIX_KEY = "g";
/** How long after G the second key still counts as a navigation shortcut. */
export const NAVIGATION_PREFIX_TIMEOUT_MS = 1500;

export const ACTION_SHORTCUTS: ShortcutDescription[] = [
	{ keys: ["S"], label: "Save a link" },
	{ keys: ["/"], label: "Search" },
	{ keys: ["?"], label: "Show keyboard shortcuts" },
];

export const NAVIGATION_SHORTCUTS: ShortcutDescription[] = primaryNavItems.map(
	(item) => ({
		keys: [NAVIGATION_PREFIX_KEY.toUpperCase(), item.shortcutKey.toUpperCase()],
		label: `Go to ${item.label}`,
	}),
);

/** Maps a key press, optionally right after G, to an app action. */
export function resolveShortcut(
	key: string,
	afterPrefix: boolean,
): ShortcutAction | null {
	const normalized = key.toLowerCase();
	if (afterPrefix) {
		const item = primaryNavItems.find(
			(navItem) => navItem.shortcutKey === normalized,
		);
		return item ? { type: "navigate", href: item.href } : null;
	}
	if (key === "?") return { type: "help" };
	if (key === "/") return { type: "search" };
	if (normalized === "s") return { type: "save" };
	if (normalized === NAVIGATION_PREFIX_KEY) return { type: "prefix" };
	return null;
}
