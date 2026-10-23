import { and, eq, inArray, sql } from "drizzle-orm";
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
import { withQuotaErrors } from "#/server/account-quota";
import type { BackupArticle } from "#/server/library-schemas";
import { checkRateLimit } from "#/server/rate-limit";

export async function importBackupArticles(
	userId: string,
	records: BackupArticle[],
) {
	const bytes = new TextEncoder().encode(JSON.stringify(records)).byteLength;
	if (records.length < 1 || records.length > 10 || bytes > 8 * 1024 * 1024)
		throw new Error(
			"Import batches must contain 1–10 articles and be smaller than 8 MiB.",
		);
	const recordsLimit = await checkRateLimit(
		{
			name: "import-records",
			windowMs: 3_600_000,
			max: 10_000,
			cost: records.length,
		},
		userId,
	);
	if (!recordsLimit.allowed)
		throw new Error(
			"Import limit reached (10,000 articles per hour). Wait an hour, then retry the same backup safely.",
		);
	const bytesLimit = await checkRateLimit(
		{
			name: "import-bytes",
			windowMs: 3_600_000,
			max: 100 * 1024 * 1024,
			cost: bytes,
		},
		userId,
	);
	if (!bytesLimit.allowed)
		throw new Error(
			"Import limit reached (100 MiB per hour). Wait an hour, then retry the same backup safely.",
		);
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
			...chunks(uniqueTags, 20).map((batch) =>
				db
					.insert(tags)
					.values(batch.map((tag) => ({ userId, ...tag })))
					.onConflictDoNothing(),
			),
			...chunks(uniqueTags, 40).map((batch) =>
				db.insert(articleTags).select(
					db
						.select({
							articleId: sql<string>`${id}`.as("article_id"),
							tagId: tags.id,
						})
						.from(tags)
						.where(
							and(
								eq(tags.userId, userId),
								inArray(
									tags.name,
									batch.map((tag) => tag.name),
								),
							),
						),
				),
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
			await withQuotaErrors(() => db.batch([insert, ...writes]));
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
