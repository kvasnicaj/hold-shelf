import { z } from "zod";

const idSchema = z.string().trim().min(1).max(128);
const articleIdsSchema = z.array(idSchema).min(1).max(100);

const httpUrlSchema = z
	.string()
	.trim()
	.max(2_048)
	.url()
	.refine((url) => {
		try {
			const parsed = new URL(url);
			return parsed.protocol === "http:" || parsed.protocol === "https:";
		} catch {
			return false;
		}
	}, "Only http/https URLs are allowed");

export const getArticlesInputSchema = z
	.object({
		isRead: z.boolean().optional(),
		isFavorite: z.boolean().optional(),
		tagId: idSchema.optional(),
		search: z.string().trim().max(200).optional(),
		sort: z.enum(["newest", "oldest", "title"]).optional(),
		limit: z.number().int().min(1).max(100).optional(),
		offset: z.number().int().min(0).max(10_000).optional(),
	})
	.default({});

export const createArticleInputSchema = z.object({
	url: httpUrlSchema,
});

export const updateArticleInputSchema = z
	.object({
		id: idSchema,
		isRead: z.boolean().optional(),
		isFavorite: z.boolean().optional(),
	})
	.refine(
		(input) => input.isRead !== undefined || input.isFavorite !== undefined,
		{
			message: "At least one mutable field is required",
		},
	);

export const deleteArticlesInputSchema = z.object({
	ids: articleIdsSchema,
});

export const createTagInputSchema = z.object({
	name: z.string().trim().min(1).max(64),
	color: z.string().trim().max(32).optional(),
});

export const updateTagInputSchema = z.object({
	id: idSchema,
	name: z.string().trim().min(1).max(64),
});

export const deleteTagInputSchema = z.object({
	id: idSchema,
});

export const tagMutationInputSchema = z.object({
	tagId: idSchema,
	articleIds: articleIdsSchema,
});

export function validateInput<T>(
	schema: z.ZodSchema<T>,
	input: unknown,
	errorMessage = "Invalid request data.",
): T {
	const result = schema.safeParse(input);
	if (!result.success) {
		throw new Error(errorMessage);
	}
	return result.data;
}
