import { z } from "zod";

const webUrl = z
	.string()
	.max(8192)
	.url()
	.refine((value) => ["https:", "http:"].includes(new URL(value).protocol));
export const backupArticleSchema = z.object({
	url: webUrl,
	title: z.string().max(10000).nullable(),
	description: z.string().max(20000).nullable(),
	faviconUrl: webUrl.nullable(),
	isRead: z.boolean(),
	isFavorite: z.boolean(),
	createdAt: z.string().datetime(),
	readAt: z.string().datetime().nullable(),
	tags: z
		.array(
			z.object({
				name: z.string().trim().min(1).max(64),
				color: z.string().max(32).nullable(),
			}),
		)
		.max(100),
	content: z
		.object({
			markdown: z.string().max(1000000),
			plainText: z.string().max(1000000),
			wordCount: z.number().int().min(1),
			fetchedAt: z.string().datetime(),
		})
		.nullable(),
	progress: z.number().int().min(0).max(10000),
	trashed: z.boolean(),
});
export const libraryBackupSchema = z.object({
	format: z.literal("hold-shelf"),
	version: z.literal(1),
	exportedAt: z.string().datetime(),
	articles: z.array(backupArticleSchema).max(10000),
});
export type BackupArticle = z.infer<typeof backupArticleSchema>;

export const deleteTrashInputSchema = z.discriminatedUnion("mode", [
	z.object({
		mode: z.literal("selected"),
		ids: z.array(z.string().min(1).max(128)).min(1).max(100),
	}),
	z.object({ mode: z.literal("all") }),
]);
export type DeleteTrashInput = z.infer<typeof deleteTrashInputSchema>;
