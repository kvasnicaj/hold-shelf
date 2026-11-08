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

/** Toast text for a link that saved but could not get all of its tags. */
export function getTagFailureMessage(failedTagCount: number): string {
	return failedTagCount === 1
		? "Saved, but one tag could not be added."
		: `Saved, but ${failedTagCount} tags could not be added.`;
}
