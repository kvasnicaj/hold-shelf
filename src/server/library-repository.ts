import { and, eq, inArray, sql } from "drizzle-orm";
import { getDb } from "#/db/index";
import { articles, articleTrash, readingProgress } from "#/db/schema";
import { activeArticle, chunks } from "#/server/db-helpers";
import type { DeleteTrashInput } from "#/server/library-schemas";

export async function deleteTrashForUser(
	userId: string,
	input: DeleteTrashInput,
) {
	const db = getDb();
	const batches =
		input.mode === "selected" ? chunks(input.ids, 90) : [undefined];
	const statements = batches.map((ids) =>
		db
			.delete(articles)
			.where(
				and(
					eq(articles.userId, userId),
					inArray(
						articles.id,
						db.select({ id: articleTrash.articleId }).from(articleTrash),
					),
					ids ? inArray(articles.id, ids) : undefined,
				),
			),
	);
	await db.batch([statements[0], ...statements.slice(1)]);
	return { success: true };
}

export async function finishReadingForUser(userId: string, id: string) {
	const db = getDb();
	// Both statements require a currently active, owned article; D1 batch is atomic.
	await db.batch([
		db
			.update(articles)
			.set({
				isRead: true,
				readAt: sql`coalesce(${articles.readAt}, unixepoch())`,
				updatedAt: new Date(),
			})
			.where(
				and(eq(articles.userId, userId), eq(articles.id, id), activeArticle()),
			),
		db
			.insert(readingProgress)
			.select(
				db
					.select({
						articleId: articles.id,
						progress: sql<number>`10000`.as("progress"),
						updatedAt: sql<Date>`unixepoch()`.as("updated_at"),
					})
					.from(articles)
					.where(
						and(
							eq(articles.userId, userId),
							eq(articles.id, id),
							activeArticle(),
						),
					),
			)
			.onConflictDoUpdate({
				target: readingProgress.articleId,
				set: { progress: 10000, updatedAt: new Date() },
			}),
	]);
	return { success: true };
}
