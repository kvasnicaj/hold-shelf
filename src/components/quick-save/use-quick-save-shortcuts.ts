import { useEffect } from "react";
import {
	isEditableTarget,
	isModalOpen,
	toHttpUrl,
} from "#/components/quick-save/helpers";

/**
 * Opens Quick save with the S key, or prefilled when a link is pasted while
 * focus is outside any text field.
 */
export function useQuickSaveShortcuts(open: (url?: string) => void) {
	useEffect(() => {
		function handleKeyDown(event: KeyboardEvent) {
			if (
				event.key.toLowerCase() !== "s" ||
				event.metaKey ||
				event.ctrlKey ||
				event.altKey ||
				event.shiftKey ||
				event.repeat ||
				event.defaultPrevented ||
				isEditableTarget(event.target) ||
				isModalOpen()
			) {
				return;
			}
			event.preventDefault();
			open();
		}

		function handlePaste(event: ClipboardEvent) {
			if (isEditableTarget(event.target) || isModalOpen()) return;
			const url = toHttpUrl(event.clipboardData?.getData("text/plain") ?? "");
			if (!url) return;
			event.preventDefault();
			open(url);
		}

		document.addEventListener("keydown", handleKeyDown);
		document.addEventListener("paste", handlePaste);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("paste", handlePaste);
		};
	}, [open]);
}
