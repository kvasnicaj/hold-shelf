import { useEffect, useRef } from "react";
import {
	NAVIGATION_PREFIX_TIMEOUT_MS,
	resolveShortcut,
} from "#/components/shortcuts/helpers";
import { isEditableTarget, isModalOpen } from "#/lib/keyboard";

type ShortcutHandlers = {
	onSave: () => void;
	onSearch: () => void;
	onHelp: () => void;
	onNavigate: (href: string) => void;
};

/** Listens for app shortcuts while focus is outside text fields and dialogs. */
export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
	const handlersRef = useRef(handlers);
	handlersRef.current = handlers;

	useEffect(() => {
		let prefixPressedAt = 0;

		function handleKeyDown(event: KeyboardEvent) {
			if (
				event.metaKey ||
				event.ctrlKey ||
				event.altKey ||
				event.repeat ||
				event.defaultPrevented ||
				(event.shiftKey && event.key !== "?") ||
				isEditableTarget(event.target) ||
				isModalOpen()
			) {
				prefixPressedAt = 0;
				return;
			}

			const afterPrefix =
				Date.now() - prefixPressedAt < NAVIGATION_PREFIX_TIMEOUT_MS;
			const action = resolveShortcut(event.key, afterPrefix);
			prefixPressedAt = 0;
			if (!action) return;

			event.preventDefault();
			const current = handlersRef.current;
			if (action.type === "prefix") prefixPressedAt = Date.now();
			else if (action.type === "save") current.onSave();
			else if (action.type === "search") current.onSearch();
			else if (action.type === "help") current.onHelp();
			else current.onNavigate(action.href);
		}

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);
}
