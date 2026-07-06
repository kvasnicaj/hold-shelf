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
