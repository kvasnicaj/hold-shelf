import { useEffect, useState } from "react";
import {
	applyThemeMode,
	isThemeMode,
	readThemeMode,
	saveThemeMode,
	THEME_CHANGE_EVENT,
} from "#/components/theme/helpers";
import type { ThemeMode } from "#/components/theme/types";

export function useThemeMode() {
	const [mode, setMode] = useState<ThemeMode>("auto");

	useEffect(() => {
		setMode(readThemeMode());
		const onChange = (event: Event) => {
			const next = (event as CustomEvent<unknown>).detail;
			if (isThemeMode(next)) setMode(next);
		};
		window.addEventListener(THEME_CHANGE_EVENT, onChange);
		return () => window.removeEventListener(THEME_CHANGE_EVENT, onChange);
	}, []);

	useEffect(() => {
		if (mode !== "auto") return;
		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const onChange = () => applyThemeMode("auto");
		media.addEventListener("change", onChange);
		return () => media.removeEventListener("change", onChange);
	}, [mode]);

	return { mode, setMode: saveThemeMode };
}
