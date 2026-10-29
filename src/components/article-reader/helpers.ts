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
export function withoutRepeatedTitle(markdown: string, title: string | null) {
	const first = markdown.match(/^#{1,6} (.+)\n+/);
	return first && first[1].trim().toLowerCase() === title?.trim().toLowerCase()
		? markdown.slice(first[0].length)
		: markdown;
}
