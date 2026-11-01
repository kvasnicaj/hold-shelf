import { Desktop, type Icon, Moon, Sun } from "@phosphor-icons/react";
import type { ThemeMode } from "#/components/theme/types";

const THEME_STORAGE_KEY = "theme";
/** Lets every theme control on the page follow a change made in another. */
export const THEME_CHANGE_EVENT = "hold-shelf:theme-change";

export const THEME_OPTIONS = [
	{ value: "light", label: "Light", icon: Sun },
	{ value: "dark", label: "Dark", icon: Moon },
	{ value: "auto", label: "System", icon: Desktop },
] as const satisfies ReadonlyArray<{
	value: ThemeMode;
	label: string;
	icon: Icon;
}>;

export function isThemeMode(value: unknown): value is ThemeMode {
	return value === "light" || value === "dark" || value === "auto";
}

export function readThemeMode(): ThemeMode {
	if (typeof window === "undefined") return "auto";
	try {
		const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
		return isThemeMode(stored) ? stored : "auto";
	} catch {
		return "auto";
	}
}

/** Mirrors the init script in `__root.tsx`, which applies the stored mode before paint. */
export function applyThemeMode(mode: ThemeMode) {
	const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
	const resolved = mode === "auto" ? (prefersDark ? "dark" : "light") : mode;
	const root = document.documentElement;

	root.classList.remove("light", "dark");
	root.classList.add(resolved);
	if (mode === "auto") {
		root.removeAttribute("data-theme");
	} else {
		root.setAttribute("data-theme", mode);
	}
	root.style.colorScheme = resolved;
}

export function saveThemeMode(mode: ThemeMode) {
	applyThemeMode(mode);
	try {
		window.localStorage.setItem(THEME_STORAGE_KEY, mode);
	} catch {
		// The choice still applies to this page.
	}
	window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: mode }));
}
