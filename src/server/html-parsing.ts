export function extractTag(html: string, regex: RegExp): string | null {
	const match = html.match(regex);
	return match?.[1]?.trim() || null;
}

export function extractMeta(html: string, name: string): string | null {
	const patterns = [
		new RegExp(
			`<meta[^>]*(?:name|property)=["']${escapeRegex(name)}["'][^>]*content=["']([^"']*)["']`,
			"i",
		),
		new RegExp(
			`<meta[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["']${escapeRegex(name)}["']`,
			"i",
		),
	];

	for (const pattern of patterns) {
		const match = html.match(pattern);
		if (match?.[1]?.trim()) return match[1].trim();
	}

	return null;
}

export function extractFavicon(html: string, origin: string): string | null {
	const match =
		html.match(
			/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']*)["']/i,
		) ??
		html.match(
			/<link[^>]*href=["']([^"']*)["'][^>]*rel=["'](?:shortcut )?icon["']/i,
		);

	if (!match?.[1]) return null;

	const href = match[1].trim();
	if (href.startsWith("http")) return href;
	if (href.startsWith("//")) return `https:${href}`;
	return `${origin}${href.startsWith("/") ? "" : "/"}${href}`;
}

export function decodeHtmlEntities(text: string): string {
	return text
		.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) =>
			String.fromCodePoint(Number.parseInt(hex, 16)),
		)
		.replace(/&#(\d+);/g, (_, dec) =>
			String.fromCodePoint(Number.parseInt(dec, 10)),
		)
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&quot;/g, '"')
		.replace(/&apos;/g, "'")
		.replace(/&nbsp;/g, " ");
}

export function escapeRegex(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
