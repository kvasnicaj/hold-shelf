export type HighlightPart = {
	text: string;
	match: boolean;
};

export function getHighlightedParts(
	text: string,
	query: string,
): HighlightPart[] {
	const trimmedQuery = query.trim();
	if (!trimmedQuery) {
		return [{ text, match: false }];
	}

	const index = text.toLowerCase().indexOf(trimmedQuery.toLowerCase());
	if (index === -1) {
		return [{ text, match: false }];
	}

	return [
		{ text: text.slice(0, index), match: false },
		{ text: text.slice(index, index + trimmedQuery.length), match: true },
		{ text: text.slice(index + trimmedQuery.length), match: false },
	].filter((part) => part.text.length > 0);
}

/**
 * Trims a raw passage around a match to whole words and marks the cut ends,
 * keeping the match itself even when it falls on an edge.
 */
export function toExcerptText(passage: string, query: string) {
	const text = passage.replace(/\s+/g, " ").trim();
	const matchAt = text.toLowerCase().indexOf(query.trim().toLowerCase());
	const firstBreak = text.indexOf(" ");
	const lastBreak = text.lastIndexOf(" ");
	const start = firstBreak > 0 && firstBreak < matchAt ? firstBreak + 1 : 0;
	const end =
		lastBreak > matchAt + query.trim().length ? lastBreak : text.length;
	return `${start > 0 ? "…" : ""}${text.slice(start, end)}${end < text.length ? "…" : ""}`;
}

export function getSearchPreviewText({
	title,
	description,
	url,
	hostname,
	matchExcerpt,
	query,
}: {
	title: string | null;
	description: string | null;
	url: string;
	hostname?: string | null;
	matchExcerpt?: string | null;
	query: string;
}) {
	const normalizedQuery = query.trim().toLowerCase();
	const descriptionText = description ?? "";
	const sourceText = hostname ?? url;
	const matches = (text: string | null | undefined) =>
		Boolean(normalizedQuery && text?.toLowerCase().includes(normalizedQuery));

	if (matches(descriptionText)) {
		return descriptionText;
	}

	if (matches(url)) {
		return url;
	}

	if (matches(sourceText)) {
		return sourceText;
	}

	// A title match explains itself; a body match shows the passage it came from.
	if (matchExcerpt && !matches(title)) {
		return toExcerptText(matchExcerpt, query);
	}

	return descriptionText || sourceText || title || url;
}

export function getMatchCountLabel(total: number) {
	if (total === 0) return "No matches";
	return total === 1 ? "1 matching article" : `${total} matching articles`;
}
