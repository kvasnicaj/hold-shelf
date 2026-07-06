import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { SidebarUserMenuItem } from "#/components/layout/sidebar-user-menu-item";
import { Button } from "#/components/ui/button";

type ThemeMode = "light" | "dark" | "auto";
type ThemeToggleSize = "icon-sm" | "icon" | "icon-lg";
type ThemeToggleVariant = "button" | "menu-item";

function getInitialMode(): ThemeMode {
	if (typeof window === "undefined") {
		return "auto";
	}

	const stored = window.localStorage.getItem("theme");
	if (stored === "light" || stored === "dark" || stored === "auto") {
		return stored;
	}

	return "auto";
}

function applyThemeMode(mode: ThemeMode) {
	const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
	const resolved = mode === "auto" ? (prefersDark ? "dark" : "light") : mode;

	document.documentElement.classList.remove("light", "dark");
	document.documentElement.classList.add(resolved);

	if (mode === "auto") {
		document.documentElement.removeAttribute("data-theme");
	} else {
		document.documentElement.setAttribute("data-theme", mode);
	}

	document.documentElement.style.colorScheme = resolved;
}

export default function ThemeToggle({
	variant = "button",
	size = "icon-sm",
}: {
	variant?: ThemeToggleVariant;
	size?: ThemeToggleSize;
}) {
	const [mode, setMode] = useState<ThemeMode>("auto");

	useEffect(() => {
		const initialMode = getInitialMode();
		setMode(initialMode);
		applyThemeMode(initialMode);
	}, []);

	useEffect(() => {
		if (mode !== "auto") {
			return;
		}

		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const onChange = () => applyThemeMode("auto");

		media.addEventListener("change", onChange);
		return () => {
			media.removeEventListener("change", onChange);
		};
	}, [mode]);

	function toggleMode() {
		const nextMode: ThemeMode =
			mode === "light" ? "dark" : mode === "dark" ? "auto" : "light";
		setMode(nextMode);
		applyThemeMode(nextMode);
		window.localStorage.setItem("theme", nextMode);
	}

	const modeLabel =
		mode === "auto" ? "System" : mode === "light" ? "Light" : "Dark";
	const buttonLabel = `Theme: ${modeLabel.toLowerCase()}`;
	const Icon = mode === "light" ? Sun : mode === "dark" ? Moon : Monitor;

	if (variant === "menu-item") {
		return (
			<SidebarUserMenuItem
				icon={Icon}
				onSelect={(event) => {
					event.preventDefault();
					toggleMode();
				}}
			>
				{modeLabel}
			</SidebarUserMenuItem>
		);
	}

	return (
		<Button
			variant="ghost"
			size={size}
			onClick={toggleMode}
			aria-label={buttonLabel}
			title={buttonLabel}
		>
			<Icon className="h-[1.125rem] w-[1.125rem]" />
		</Button>
	);
}
