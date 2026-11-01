import type {
	ReaderSettings,
	ReaderWidth,
} from "#/components/article-reader/types";

export const READER_SETTINGS_KEY = "reader-preferences";
/** Scroll progress (out of 10000) at which an article counts as finished. */
export const READ_AT_END_PROGRESS = 9800;
export const READER_FONT_SIZE_RANGE = { min: 15, max: 24 } as const;
export const DEFAULT_READER_SETTINGS: ReaderSettings = {
	fontSize: 19,
	width: "normal",
	font: "serif",
};
export const READER_MEASURES: Record<ReaderWidth, string> = {
	narrow: "56ch",
	normal: "64ch",
	wide: "76ch",
};

export function clampReaderFontSize(size: number) {
	return Math.max(
		READER_FONT_SIZE_RANGE.min,
		Math.min(READER_FONT_SIZE_RANGE.max, Math.round(size)),
	);
}

/** Reads stored reader settings, keeping defaults for anything missing or invalid. */
export function parseReaderSettings(raw: string | null): ReaderSettings {
	try {
		const value = JSON.parse(raw ?? "null") as Partial<ReaderSettings> | null;
		if (!value || typeof value !== "object") return DEFAULT_READER_SETTINGS;
		return {
			fontSize: Number(value.fontSize)
				? clampReaderFontSize(Number(value.fontSize))
				: DEFAULT_READER_SETTINGS.fontSize,
			width:
				value.width && value.width in READER_MEASURES
					? value.width
					: DEFAULT_READER_SETTINGS.width,
			font:
				value.font === "sans" || value.font === "serif"
					? value.font
					: DEFAULT_READER_SETTINGS.font,
		};
	} catch {
		return DEFAULT_READER_SETTINGS;
	}
}

export function getUnreadAgeLabel(article: {
	isRead: boolean;
	createdAt?: Date | null;
}) {
	if (article.isRead || !article.createdAt) {
		return null;
	}

	const diffMs = Date.now() - article.createdAt.getTime();
	const days = Math.max(0, Math.floor(diffMs / 86_400_000));

	if (days === 0) {
		return "Saved today";
	}

	if (days === 1) {
		return "Unread for 1 day";
	}

	return `Unread for ${days} days`;
}

export function getReadingTimeLabel(wordCount?: number) {
	if (!wordCount) {
		return null;
	}

	const minutes = Math.max(1, Math.round(wordCount / 220));
	return `${minutes} min read`;
}

export function articleIdFromHash(hash: string): string | null {
	if (!hash.startsWith("article=")) return null;
	try {
		const id = decodeURIComponent(hash.slice(8));
		return id.length > 0 && id.length <= 128 ? id : null;
	} catch {
		return null;
	}
}
const LEADING_HEADING = /^\s*#{1,6}[ \t]+(.+?)[ \t]*#*[ \t]*(?:\n+|$)/;
/** A publisher name is short; anything longer is a subtitle worth keeping. */
const MAX_PUBLISHER_WORDS = 6;
const MAX_PUBLISHER_LENGTH = 48;

/** Markdown heading or saved title as plain text, keeping its own casing. */
export function toPlainTitle(text: string) {
	return text
		.replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/\\(.)/g, "$1")
		.replace(/(\*\*|__|\*|`|~~)/g, "")
		.replace(/(^|\s)_(\S[^_]*)_(?=\s|$)/g, "$1$2")
		.replace(/\s+/g, " ")
		.trim();
}

/** Comparable form: plain text, one kind of quote and dash, no case or end punctuation. */
function normalizeTitle(text: string) {
	return toPlainTitle(text)
		.normalize("NFKC")
		.replace(/[\u2018\u2019\u201a\u201b\u2032]/g, "'")
		.replace(/[\u201c\u201d\u201e\u201f\u2033]/g, '"')
		.replace(/[\u2010-\u2015\u2212]/g, "-")
		.replace(/[\s.!?,;:]+$/, "")
		.toLowerCase();
}

function isPublisherName(text: string) {
	const name = text.trim();
	return (
		name.length > 0 &&
		name.length <= MAX_PUBLISHER_LENGTH &&
		name.split(/\s+/).length <= MAX_PUBLISHER_WORDS
	);
}

/**
 * True when `full` is `short` plus a publisher, either "Title — Site" or
 * "Site | Title". A spaced dash, a bar, a middle dot, a bullet or » separates
 * them; a colon does not, since "Topic: subtitle" is part of the title.
 */
function hasPublisherAround(full: string, short: string) {
	if (full.startsWith(short)) {
		const suffix = full
			.slice(short.length)
			.match(/^(?:\s+-\s+|\s*[|·•»]\s*)(.+)$/);
		return Boolean(suffix && isPublisherName(suffix[1]));
	}
	if (full.endsWith(short)) {
		const prefix = full
			.slice(0, full.length - short.length)
			.match(/^(.+?)(?:\s+-\s+|\s*[|·•»]\s*)$/);
		return Boolean(prefix && isPublisherName(prefix[1]));
	}
	return false;
}

/**
 * Many pages open with the article title as a heading, and saved titles often
 * add the publisher ("Impossible Components — overreacted"). When the first
 * heading is the same title, drop it from the body and show one title: the
 * version without the publisher, which the source line already names.
 */
export function splitRepeatedTitle(
	markdown: string,
	title: string | null,
): { title: string | null; markdown: string } {
	const first = markdown.match(LEADING_HEADING);
	if (!first || !title) return { title, markdown };
	const heading = normalizeTitle(first[1]);
	const saved = normalizeTitle(title);
	if (!heading || !saved) return { title, markdown };
	const body = markdown.slice(first[0].length);
	if (heading === saved) return { title, markdown: body };
	if (hasPublisherAround(saved, heading)) {
		return { title: toPlainTitle(first[1]), markdown: body };
	}
	if (hasPublisherAround(heading, saved)) return { title, markdown: body };
	return { title, markdown };
}
