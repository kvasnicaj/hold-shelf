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

export function getSearchPreviewText({
	title,
	description,
	url,
	hostname,
	query,
}: {
	title: string | null;
	description: string | null;
	url: string;
	hostname?: string | null;
	query: string;
}) {
	const normalizedQuery = query.trim().toLowerCase();
	const descriptionText = description ?? "";
	const sourceText = hostname ?? url;

	if (
		normalizedQuery &&
		descriptionText.toLowerCase().includes(normalizedQuery)
	) {
		return descriptionText;
	}

	if (normalizedQuery && url.toLowerCase().includes(normalizedQuery)) {
		return url;
	}

	if (normalizedQuery && sourceText.toLowerCase().includes(normalizedQuery)) {
		return sourceText;
	}

	return descriptionText || sourceText || title || url;
}
