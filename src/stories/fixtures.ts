import type { ReaderSettings } from "#/components/article-reader/types";
import type { Tag, TagShare } from "#/components/tags/types";
import type {
	ArticleReaderRecord,
	ArticleWithTagsRecord,
} from "#/server/articles-service";

export const sampleDate = new Date("2026-10-26T10:00:00Z");
export const sampleTags: Array<Tag & { articleCount: number }> = [
	{ id: "design", name: "Design", color: null, articleCount: 3 },
	{ id: "engineering", name: "Engineering", color: null, articleCount: 2 },
	{ id: "weekend", name: "Weekend reads", color: null, articleCount: 1 },
];

export const sampleArticles: ArticleWithTagsRecord[] = [
	{
		id: "article-1",
		userId: "storybook-reader",
		url: "https://example.com/a-reading-habit",
		title: "Making room for a reading habit",
		description:
			"A small daily ritual can turn a growing reading list into a source of useful ideas.",
		hostname: "example.com",
		faviconUrl: null,
		isRead: false,
		isFavorite: true,
		createdAt: sampleDate,
		updatedAt: sampleDate,
		readAt: null,
		tags: [sampleTags[0]],
	},
	{
		id: "article-2",
		userId: "storybook-reader",
		url: "https://example.com/meaningful-interfaces",
		title: "Designing interfaces that respect your attention",
		description:
			"Clear language, useful defaults and a few well-chosen actions make a product easier to use.",
		hostname: "example.com",
		faviconUrl: null,
		isRead: true,
		isFavorite: false,
		createdAt: new Date("2026-09-18T08:00:00Z"),
		updatedAt: sampleDate,
		readAt: sampleDate,
		tags: [sampleTags[0], sampleTags[1]],
	},
	{
		id: "article-3",
		userId: "storybook-reader",
		url: "https://example.org/garden-notes",
		title: "Notes from a quiet garden",
		description:
			"An afternoon outside, a notebook, and a reminder to leave some things unfinished.",
		hostname: "example.org",
		faviconUrl: null,
		isRead: false,
		isFavorite: false,
		createdAt: new Date("2026-08-12T12:00:00Z"),
		updatedAt: sampleDate,
		readAt: null,
		tags: [sampleTags[2]],
	},
];
export const sampleArticle = sampleArticles[0];
export const sampleMarkdown = `# Making room for a reading habit

A reading list is a promise to your future self. **A little space** in your day helps you keep it.

## Start with a small shelf

Choose one article and give it your attention. You can return to the rest later.

> Read with curiosity, and leave a note for the person you will be tomorrow.

- Save something worth returning to.
- Set aside a few quiet minutes.
- Keep your place when you stop.

### Make it repeatable

The best routine is one that fits your life. Try an *unhurried* ten minutes with a cup of tea.

\`\`\`ts
const reading = { minutes: 10, distractions: 0 };
\`\`\`

| Habit | Frequency |
| --- | --- |
| Read an article | Daily |
| Revisit notes | Weekly |

Learn more from [your own notes](https://example.com/notes).
`;
export const sampleReader: ArticleReaderRecord = {
	article: sampleArticle,
	content: {
		status: "ready",
		markdown: sampleMarkdown,
		plainText: "Making room for a reading habit",
		wordCount: 840,
		fetchedAt: sampleDate,
	},
};
export const sampleSettings: ReaderSettings = {
	fontSize: 19,
	width: "normal",
	font: "serif",
};
export const sampleContinueReading = sampleArticles
	.filter((article) => !article.isRead)
	.map((article, index) => ({
		...article,
		progress: index === 0 ? 4200 : 1800,
	}));
export const sampleStats = {
	unread: 2,
	total: 3,
	readThisWeek: 1,
	savedThisWeek: 3,
};
export const sampleRecent = {
	recentlySaved: sampleArticles,
	recentlyFavorite: [sampleArticle],
	oldestUnread: [sampleArticles[2], sampleArticle],
};
export const sampleShare: TagShare = {
	tagId: "design",
	token: "storybook-example-sharing-link",
	createdAt: sampleDate,
};
export const sampleToken = {
	tokenPrefix: "hs_demo",
	createdAt: sampleDate,
	lastUsedAt: sampleDate,
};
export const sampleUser = {
	id: "storybook-reader",
	name: "Alex Reader",
	email: "alex@example.com",
	image: null,
	emailVerified: true,
	createdAt: sampleDate,
	updatedAt: sampleDate,
};

export const sampleTrash = sampleArticles.slice(1).map((article) => ({
	...article,
	id: `trash-${article.id}`,
	url: `${article.url}-trashed`,
}));
