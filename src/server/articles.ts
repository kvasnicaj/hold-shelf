import { createServerFn } from "@tanstack/react-start";
import { createArticlesRepository } from "#/server/articles-repository";
import {
	handleCreateArticle,
	handleDeleteArticles,
	handleGetArticles,
	handleUpdateArticle,
	validateCreateArticleInput,
	validateDeleteArticlesInput,
	validateGetArticlesInput,
	validateUpdateArticleInput,
} from "#/server/articles-runtime";
import { requireUserId } from "#/server/helpers";

export const getArticles = createServerFn({ method: "GET" })
	.validator(validateGetArticlesInput)
	.handler(async ({ data }) =>
		handleGetArticles(data, {
			createRepository: createArticlesRepository,
			requireUserIdFn: requireUserId,
		}),
	);

export const createArticle = createServerFn({ method: "POST" })
	.validator(validateCreateArticleInput)
	.handler(async ({ data }) =>
		handleCreateArticle(data, {
			createRepository: createArticlesRepository,
			requireUserIdFn: requireUserId,
		}),
	);

export const updateArticle = createServerFn({ method: "POST" })
	.validator(validateUpdateArticleInput)
	.handler(async ({ data }) =>
		handleUpdateArticle(data, {
			createRepository: createArticlesRepository,
			requireUserIdFn: requireUserId,
		}),
	);

export const deleteArticles = createServerFn({ method: "POST" })
	.validator(validateDeleteArticlesInput)
	.handler(async ({ data }) =>
		handleDeleteArticles(data, {
			createRepository: createArticlesRepository,
			requireUserIdFn: requireUserId,
		}),
	);
