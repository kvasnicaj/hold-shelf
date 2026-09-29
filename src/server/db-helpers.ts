import { sql } from "drizzle-orm";
import { articles } from "#/db/schema";

export { chunks } from "#/lib/helpers";
export function activeArticle() {
	return sql`NOT EXISTS (SELECT 1 FROM article_trash WHERE article_trash.article_id = ${articles.id})`;
}
