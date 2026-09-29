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
