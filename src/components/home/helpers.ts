export const LANDING_PAGE_TITLE =
	"Hold Shelf | Save articles you'll actually read";

export const LANDING_PAGE_DESCRIPTION =
	"Save articles from the web or Chrome. Hold Shelf keeps their text, remembers where you stopped reading, and shows what has waited longest.";

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

export const LANDING_FEATURES = [
	{
		title: "Save in one step",
		text: "Paste a link, press S, or use the Chrome extension. Add tags now or later.",
	},
	{
		title: "The text stays with you",
		text: "Hold Shelf stores each article’s text when you save it, so it still opens if the page changes or goes away.",
	},
	{
		title: "Pick up where you stopped",
		text: "Your place is saved as you scroll. Home leads with what you were reading and what has waited longest.",
	},
] as const;

/** Example shelf for the landing preview; real essays at their real addresses. */
export const LANDING_PREVIEW = {
	continueReading: {
		title: "How to Do Great Work",
		hostname: "paulgraham.com",
		percent: 42,
		note: "42% read · about 30 min left",
	},
	unread: [
		{
			title: "Impossible Components",
			hostname: "overreacted.io",
			note: "Saved today",
			isFavorite: false,
		},
		{
			title: "Write code that is easy to delete, not easy to extend",
			hostname: "programmingisterrible.com",
			note: "Unread for 4 days",
			isFavorite: true,
		},
		{
			title: "The Web’s Grain",
			hostname: "frankchimero.com",
			note: "Unread for 12 days",
			isFavorite: false,
		},
	],
} as const;
