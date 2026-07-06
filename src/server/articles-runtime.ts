import { extractArticleContent } from "#/server/article-content";
import {
	type ArticlesRepository,
	createArticleForUser,
	deleteArticlesForUser,
	getArticleReaderForUser,
	getArticlesForUser,
	updateArticleForUser,
} from "#/server/articles-service";
import {
	createArticleInputSchema,
	deleteArticlesInputSchema,
	getArticleReaderInputSchema,
	getArticlesInputSchema,
	updateArticleInputSchema,
	validateInput,
} from "#/server/input-schemas";
import { extractMetadata } from "#/server/metadata";
import { checkRateLimit } from "#/server/rate-limit";

type ArticlesRuntimeDependencies = {
	createRepository: () => ArticlesRepository;
	requireUserIdFn: () => Promise<string>;
	getArticlesForUserFn?: typeof getArticlesForUser;
	getArticleReaderForUserFn?: typeof getArticleReaderForUser;
	createArticleForUserFn?: typeof createArticleForUser;
	updateArticleForUserFn?: typeof updateArticleForUser;
	deleteArticlesForUserFn?: typeof deleteArticlesForUser;
	checkRateLimitFn?: typeof checkRateLimit;
	extractMetadataFn?: typeof extractMetadata;
	extractArticleContentFn?: typeof extractArticleContent;
};

export function validateGetArticlesInput(input: unknown) {
	return validateInput(
		getArticlesInputSchema,
		input ?? {},
		"Invalid article query.",
	);
}

export function validateCreateArticleInput(input: unknown) {
	return validateInput(createArticleInputSchema, input, "Invalid article URL.");
}

export function validateGetArticleReaderInput(input: unknown) {
	return validateInput(
		getArticleReaderInputSchema,
		input,
		"Invalid article reader request.",
	);
}

export function validateUpdateArticleInput(input: unknown) {
	return validateInput(
		updateArticleInputSchema,
		input,
		"Invalid article update.",
	);
}

export function validateDeleteArticlesInput(input: unknown) {
	return validateInput(
		deleteArticlesInputSchema,
		input,
		"Invalid article selection.",
	);
}

export async function handleGetArticles(
	data: ReturnType<typeof validateGetArticlesInput>,
	deps: ArticlesRuntimeDependencies,
) {
	const userId = await deps.requireUserIdFn();
	return (deps.getArticlesForUserFn ?? getArticlesForUser)({
		repo: deps.createRepository(),
		userId,
		data,
	});
}

export async function handleCreateArticle(
	data: ReturnType<typeof validateCreateArticleInput>,
	deps: ArticlesRuntimeDependencies,
) {
	const userId = await deps.requireUserIdFn();
	return (deps.createArticleForUserFn ?? createArticleForUser)({
		repo: deps.createRepository(),
		userId,
		url: data.url,
		checkRateLimitFn: deps.checkRateLimitFn ?? checkRateLimit,
		extractMetadataFn: deps.extractMetadataFn ?? extractMetadata,
	});
}

export async function handleGetArticleReader(
	data: ReturnType<typeof validateGetArticleReaderInput>,
	deps: ArticlesRuntimeDependencies,
) {
	const userId = await deps.requireUserIdFn();
	return (deps.getArticleReaderForUserFn ?? getArticleReaderForUser)({
		repo: deps.createRepository(),
		userId,
		id: data.id,
		extractArticleContentFn:
			deps.extractArticleContentFn ?? extractArticleContent,
	});
}

export async function handleUpdateArticle(
	data: ReturnType<typeof validateUpdateArticleInput>,
	deps: ArticlesRuntimeDependencies,
) {
	const userId = await deps.requireUserIdFn();
	return (deps.updateArticleForUserFn ?? updateArticleForUser)({
		repo: deps.createRepository(),
		userId,
		data,
	});
}

export async function handleDeleteArticles(
	data: ReturnType<typeof validateDeleteArticlesInput>,
	deps: ArticlesRuntimeDependencies,
) {
	const userId = await deps.requireUserIdFn();
	return (deps.deleteArticlesForUserFn ?? deleteArticlesForUser)({
		repo: deps.createRepository(),
		userId,
		ids: data.ids,
	});
}
