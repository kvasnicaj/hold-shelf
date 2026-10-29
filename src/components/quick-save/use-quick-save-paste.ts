import { useEffect } from "react";
import { toHttpUrl } from "#/components/quick-save/helpers";
import { isEditableTarget, isModalOpen } from "#/lib/keyboard";

/** Opens Quick save prefilled when a link is pasted outside any text field. */
export function useQuickSavePaste(open: (url?: string) => void) {
	useEffect(() => {
		function handlePaste(event: ClipboardEvent) {
			if (isEditableTarget(event.target) || isModalOpen()) return;
			const url = toHttpUrl(event.clipboardData?.getData("text/plain") ?? "");
			if (!url) return;
			event.preventDefault();
			open(url);
		}

		document.addEventListener("paste", handlePaste);
		return () => document.removeEventListener("paste", handlePaste);
	}, [open]);
}
