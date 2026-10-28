/**
 * Turns pasted or typed text into an http(s) URL, adding https:// when the
 * scheme is missing. Returns null for anything that isn't a web link.
 */
export function toHttpUrl(value: string): string | null {
	const trimmed = value.trim();
	if (!trimmed || /\s/.test(trimmed)) return null;

	const hasScheme = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed);
	// "mailto:", "javascript:" and similar are not links; "host:8080" is.
	if (!hasScheme && /^[a-z][a-z\d+-]*:(?!\d)/i.test(trimmed)) return null;
	const candidate = hasScheme ? trimmed : `https://${trimmed}`;
	try {
		const url = new URL(candidate);
		if (
			(url.protocol === "http:" || url.protocol === "https:") &&
			url.hostname.includes(".")
		) {
			return url.toString();
		}
	} catch {}
	return null;
}

export function getDisplayHost(url: string): string {
	return new URL(url).hostname.replace(/^www\./, "");
}

export function isEditableTarget(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false;
	return (
		target.isContentEditable ||
		target instanceof HTMLInputElement ||
		target instanceof HTMLTextAreaElement ||
		target instanceof HTMLSelectElement
	);
}

export function isModalOpen(): boolean {
	return Boolean(
		document.querySelector(
			'[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]',
		),
	);
}
