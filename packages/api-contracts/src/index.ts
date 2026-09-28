import { z } from "zod";

export const identifierSchema = z.string().trim().min(1).max(128);

export const httpUrlSchema = z
	.string()
	.trim()
	.max(2_048)
	.url()
	.refine(
		(value) => {
			try {
				return ["http:", "https:"].includes(new URL(value).protocol);
			} catch {
				return false;
			}
		},
		{ message: "Only http/https URLs are allowed" },
	);

export const articleListQuerySchema = z.object({
	isRead: z.boolean().optional(),
	isFavorite: z.boolean().optional(),
	tagId: identifierSchema.optional(),
	search: z.string().trim().max(200).optional(),
	sort: z.enum(["newest", "oldest", "title"]).optional(),
	limit: z.number().int().min(1).max(100).optional(),
	offset: z.number().int().min(0).max(10_000).optional(),
});

export const createArticleRequestSchema = z.object({
	url: httpUrlSchema,
});

export const updateArticleRequestSchema = z
	.object({
		isRead: z.boolean().optional(),
		isFavorite: z.boolean().optional(),
	})
	.refine(
		(value) => value.isRead !== undefined || value.isFavorite !== undefined,
		{ message: "At least one mutable field is required" },
	);

export const articlePathSchema = z.object({
	id: identifierSchema,
});

export const articleTagPathSchema = z.object({
	id: identifierSchema,
	tagId: identifierSchema,
});

export const apiErrorSchema = z.object({
	code: z.string(),
	message: z.string(),
});

export const meResponseSchema = z.object({
	authenticated: z.literal(true),
});

export const articleTagSchema = z.object({
	id: z.string(),
	name: z.string(),
	color: z.string().nullable(),
});

export const articleSchema = z.object({
	id: z.string(),
	url: z.url(),
	title: z.string().nullable(),
	description: z.string().nullable(),
	hostname: z.string().nullable(),
	faviconUrl: z.string().nullable(),
	isRead: z.boolean(),
	isFavorite: z.boolean(),
	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime(),
	readAt: z.iso.datetime().nullable(),
	tags: z.array(articleTagSchema),
});

export const articleListResponseSchema = z.object({
	items: z.array(articleSchema),
	total: z.number().int().nonnegative(),
});

export const articleReaderContentSchema = z.discriminatedUnion("status", [
	z.object({
		status: z.literal("ready"),
		markdown: z.string(),
		plainText: z.string(),
		wordCount: z.number().int().nonnegative(),
		fetchedAt: z.iso.datetime(),
	}),
	z.object({
		status: z.literal("unavailable"),
		reason: z.string(),
	}),
]);

export const articleReaderResponseSchema = z.object({
	article: articleSchema,
	content: articleReaderContentSchema,
});

const createdArticleSchema = z.object({
	id: z.string(),
	url: z.url(),
	title: z.string().nullable().optional(),
});

export const createArticleResponseSchema = z.discriminatedUnion("status", [
	z.object({
		status: z.literal("saved"),
		article: createdArticleSchema,
	}),
	z.object({
		status: z.literal("exists"),
		message: z.string(),
		article: createdArticleSchema,
	}),
]);

export const successResponseSchema = z.object({
	success: z.literal(true),
});

export const tagSummarySchema = articleTagSchema.extend({
	createdAt: z.iso.datetime(),
	articleCount: z.number().int().nonnegative(),
});

export const tagsResponseSchema = z.array(tagSummarySchema);

export const dashboardResponseSchema = z.object({
	total: z.number().int().nonnegative(),
	unread: z.number().int().nonnegative(),
	read: z.number().int().nonnegative(),
	readThisWeek: z.number().int().nonnegative(),
	savedThisWeek: z.number().int().nonnegative(),
});

export type ApiError = z.infer<typeof apiErrorSchema>;
export type ArticleListQuery = z.infer<typeof articleListQuerySchema>;
export type CreateArticleRequest = z.infer<typeof createArticleRequestSchema>;
export type UpdateArticleRequest = z.infer<typeof updateArticleRequestSchema>;
export type ArticlePath = z.infer<typeof articlePathSchema>;
export type ArticleTagPath = z.infer<typeof articleTagPathSchema>;
export type MeResponse = z.infer<typeof meResponseSchema>;
export type ArticleTag = z.infer<typeof articleTagSchema>;
export type Article = z.infer<typeof articleSchema>;
export type ArticleListResponse = z.infer<typeof articleListResponseSchema>;
export type ArticleReaderContent = z.infer<typeof articleReaderContentSchema>;
export type ArticleReaderResponse = z.infer<typeof articleReaderResponseSchema>;
export type CreateArticleResponse = z.infer<typeof createArticleResponseSchema>;
export type SuccessResponse = z.infer<typeof successResponseSchema>;
export type TagSummary = z.infer<typeof tagSummarySchema>;
export type TagsResponse = z.infer<typeof tagsResponseSchema>;
export type DashboardResponse = z.infer<typeof dashboardResponseSchema>;
