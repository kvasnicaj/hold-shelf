import {
	articleListQuerySchema,
	articlePathSchema,
	createArticleRequestSchema,
	identifierSchema,
	updateArticleRequestSchema,
} from "@hold-shelf/api-contracts";
import { z } from "zod";
import { TAG_SHARE_TOKEN_PATTERN } from "#/lib/shared-tag";

const idSchema = identifierSchema;
const articleIdsSchema = z.array(idSchema).min(1).max(100);

export const getArticlesInputSchema = articleListQuerySchema
	.extend({
		tagIds: z.array(idSchema).max(20).optional(),
	})
	.default({});

export const getArticleReaderInputSchema = articlePathSchema;

export const createArticleInputSchema = createArticleRequestSchema;

export const updateArticleInputSchema = articlePathSchema.and(
	updateArticleRequestSchema,
);

export const deleteArticlesInputSchema = z.object({
	ids: articleIdsSchema,
});

export const updateUserSettingsInputSchema = z.object({
	markReadOnOpen: z.boolean(),
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

export const tagShareInputSchema = z.object({
	tagId: idSchema,
});

export const sharedTagInputSchema = z.object({
	token: z.string().trim().regex(TAG_SHARE_TOKEN_PATTERN),
	page: z.number().int().min(1).max(10_000).optional(),
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
