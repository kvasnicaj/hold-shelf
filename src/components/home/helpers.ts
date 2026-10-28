export const LANDING_PAGE_TITLE =
	"Hold Shelf | Save articles you'll actually read";

export const LANDING_PAGE_DESCRIPTION =
	"A quiet read-it-later app for saving articles from the web or Chrome, organizing your reading list, and coming back when you're ready to read.";

export const LANDING_PAGE_CANONICAL_URL = "https://hold-shelf.com/";

export const LANDING_PAGE_OG_IMAGE_URL =
	"https://hold-shelf.com/brand/social-card.png";

export const CHROME_EXTENSION_URL =
	"https://chromewebstore.google.com/detail/hold-shelf/pbadpcgedkohkechgiciabdafiddhjkj";

export function getHomeSummary(stats: { unread: number; total: number }) {
	if (stats.total === 0) return "Your shelf is empty for now.";
	if (stats.unread === 0) {
		return "You're all caught up. The shelf is here when you want it.";
	}
	if (stats.unread === 1) return "One article is waiting for you.";
	return `${stats.unread} articles are waiting for you.`;
}
