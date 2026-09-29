import { and, eq, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";
import { getDb } from "#/db/index";
import {
	articleContentCache,
	articles,
	articleTags,
	articleTrash,
	readingProgress,
	tags,
} from "#/db/schema";
import { chunks } from "#/lib/helpers";
import type { BackupArticle } from "#/server/library-schemas";

export async function importBackupArticles(
	userId: string,
	records: BackupArticle[],
) {
	const db = getDb();
	let imported = 0;
	let skipped = 0;
	for (const record of records) {
		const [existing] = await db
			.select({ id: articles.id })
			.from(articles)
			.where(and(eq(articles.userId, userId), eq(articles.url, record.url)))
			.limit(1);
		if (existing) {
			skipped++;
			continue;
		}
		const id = nanoid();
		const uniqueTags = [
			...new Map(record.tags.map((tag) => [tag.name, tag])).values(),
		];
		for (const batch of chunks(uniqueTags, 20))
			await db
				.insert(tags)
				.values(batch.map((tag) => ({ userId, ...tag })))
				.onConflictDoNothing();
		const tagIds: string[] = [];
		for (const batch of chunks(uniqueTags, 90)) {
			const saved = await db
				.select({ id: tags.id })
				.from(tags)
				.where(
					and(
						eq(tags.userId, userId),
						inArray(
							tags.name,
							batch.map((tag) => tag.name),
						),
					),
				);
			tagIds.push(...saved.map((tag) => tag.id));
		}

		const insert = db.insert(articles).values({
			id,
			userId,
			url: record.url,
			hostname: new URL(record.url).hostname,
			title: record.title,
			description: record.description,
			faviconUrl: record.faviconUrl,
			isRead: record.isRead,
			isFavorite: record.isFavorite,
			createdAt: new Date(record.createdAt),
			readAt: record.readAt ? new Date(record.readAt) : null,
		});
		const writes = [
			...chunks(tagIds, 50).map((batch) =>
				db
					.insert(articleTags)
					.values(batch.map((tagId) => ({ articleId: id, tagId }))),
			),
			db
				.insert(readingProgress)
				.values({ articleId: id, progress: record.progress }),
			...(record.trashed
				? [db.insert(articleTrash).values({ articleId: id })]
				: []),
			...(record.content
				? [
						db.insert(articleContentCache).values({
							articleId: id,
							status: "ready" as const,
							...record.content,
							fetchedAt: new Date(record.content.fetchedAt),
							sourceUrl: record.url,
							extractionVersion: "markdown-v3",
						}),
					]
				: []),
		];
		try {
			await db.batch([insert, ...writes]);
			imported++;
		} catch (error) {
			const [duplicate] = await db
				.select({ id: articles.id })
				.from(articles)
				.where(and(eq(articles.userId, userId), eq(articles.url, record.url)))
				.limit(1);
			if (!duplicate) throw error;
			skipped++;
		}
	}
	return { imported, skipped };
}
