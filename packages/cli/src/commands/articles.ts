import type { Command } from "commander";
import { Option } from "commander";
import {
	positiveInteger,
	validateArticleUrl,
	validateIdentifier,
} from "../helpers.js";
import {
	renderArticle,
	renderArticleList,
	writeJson,
	writeLine,
} from "../output/render.js";
import type { RuntimeDependencies } from "../types.js";
import {
	createAuthenticatedContext,
	createListQuery,
	type ListOptions,
	resolveTag,
} from "./helpers.js";

type ShowOptions = { format: "text" | "markdown" };
type AddOptions = { tag: string[] };
type MarkOptions = { read?: boolean; unread?: boolean };
type DeleteOptions = { yes?: boolean };

export function registerArticleCommands(
	root: Command,
	dependencies: RuntimeDependencies,
): void {
	const articles = root
		.command("articles")
		.description("List, read, save, and manage articles");

	addListOptions(
		articles.command("list").description("List saved articles"),
	).action(async (localOptions: ListOptions, command: Command) => {
		await listArticles({ command, localOptions, dependencies });
	});

	addListOptions(
		articles
			.command("search <query>")
			.description("Search titles, descriptions, and URLs"),
	).action(
		async (query: string, localOptions: ListOptions, command: Command) => {
			await listArticles({
				command,
				localOptions,
				dependencies,
				search: query,
			});
		},
	);

	addListOptions(
		articles.command("favorites").description("List favorite articles"),
	).action(async (localOptions: ListOptions, command: Command) => {
		await listArticles({
			command,
			localOptions,
			dependencies,
			forceFavorite: true,
		});
	});

	articles
		.command("show <article-id>")
		.description("Show an article and its extracted text")
		.addOption(
			new Option("--format <format>", "Content format")
				.choices(["text", "markdown"])
				.default("text"),
		)
		.action(
			async (
				articleId: string,
				localOptions: ShowOptions,
				command: Command,
			) => {
				const context = await createAuthenticatedContext(command, dependencies);
				const result = await context.client.getArticle(
					validateIdentifier(articleId),
				);
				if (context.options.json) {
					writeJson(dependencies.stdout, result);
				} else {
					renderArticle(dependencies.stdout, result, localOptions.format);
				}
			},
		);

	articles
		.command("add <url>")
		.description("Save a new article")
		.option(
			"--tag <name>",
			"Assign an existing tag (repeatable)",
			(value: string, previous: string[]) => [...previous, value],
			[],
		)
		.action(async (url: string, localOptions: AddOptions, command: Command) => {
			const context = await createAuthenticatedContext(command, dependencies);
			const allTags = localOptions.tag.length
				? await context.client.listTags()
				: [];
			const tags = Array.from(
				new Map(
					localOptions.tag.map((name) => {
						const tag = resolveTag(allTags, name);
						return [tag.id, tag] as const;
					}),
				).values(),
			);
			const result = await context.client.createArticle(
				validateArticleUrl(url),
			);
			for (const tag of tags) {
				await context.client.addTag(result.article.id, tag.id);
			}

			if (context.options.json) {
				writeJson(dependencies.stdout, {
					...result,
					assignedTags: tags.map(({ id, name }) => ({ id, name })),
				});
				return;
			}
			writeLine(
				dependencies.stdout,
				result.status === "saved"
					? `Saved article ${result.article.id}.`
					: tags.length > 0
						? `Article already exists as ${result.article.id}; tag assignment was resumed.`
						: `Article already exists as ${result.article.id}.`,
			);
			if (tags.length > 0) {
				writeLine(
					dependencies.stdout,
					`Assigned tags: ${tags.map((tag) => tag.name).join(", ")}`,
				);
			}
		});

	articles
		.command("mark <article-id>")
		.description("Mark an article read or unread")
		.option("--read", "Mark as read")
		.option("--unread", "Mark as unread")
		.action(
			async (
				articleId: string,
				localOptions: MarkOptions,
				command: Command,
			) => {
				if (Boolean(localOptions.read) === Boolean(localOptions.unread)) {
					throw new (await import("../errors.js")).UsageError(
						"Specify exactly one of --read or --unread.",
					);
				}
				const isRead = localOptions.read === true;
				await updateArticleState({
					command,
					dependencies,
					articleId,
					changes: { isRead },
					humanMessage: `Marked article ${articleId} ${isRead ? "read" : "unread"}.`,
				});
			},
		);

	articles
		.command("favorite <article-id>")
		.description("Mark an article as favorite")
		.action(async (articleId: string, _options: object, command: Command) => {
			await updateArticleState({
				command,
				dependencies,
				articleId,
				changes: { isFavorite: true },
				humanMessage: `Marked article ${articleId} as favorite.`,
			});
		});

	articles
		.command("unfavorite <article-id>")
		.description("Remove an article from favorites")
		.action(async (articleId: string, _options: object, command: Command) => {
			await updateArticleState({
				command,
				dependencies,
				articleId,
				changes: { isFavorite: false },
				humanMessage: `Removed article ${articleId} from favorites.`,
			});
		});

	const tag = articles.command("tag").description("Manage article tags");
	tag
		.command("add <article-id> <tag-name>")
		.description("Add an existing tag to an article")
		.action(
			async (
				articleId: string,
				tagName: string,
				_options: object,
				command: Command,
			) => {
				await mutateTag({
					command,
					dependencies,
					articleId,
					tagName,
					operation: "add",
				});
			},
		);
	tag
		.command("remove <article-id> <tag-name>")
		.description("Remove a tag from an article")
		.action(
			async (
				articleId: string,
				tagName: string,
				_options: object,
				command: Command,
			) => {
				await mutateTag({
					command,
					dependencies,
					articleId,
					tagName,
					operation: "remove",
				});
			},
		);

	articles
		.command("delete <article-id>")
		.description("Delete an article")
		.option("--yes", "Skip confirmation")
		.action(
			async (
				articleId: string,
				localOptions: DeleteOptions,
				command: Command,
			) => {
				const context = await createAuthenticatedContext(command, dependencies);
				const id = validateIdentifier(articleId);
				if (!localOptions.yes) {
					if (
						context.options.json ||
						!dependencies.stdin.isTTY ||
						!dependencies.stdout.isTTY
					) {
						throw new (await import("../errors.js")).UsageError(
							"Deletion requires --yes when running non-interactively or with --json.",
						);
					}
					const accepted = await dependencies.confirm(
						`Delete article ${id}? This cannot be undone.`,
					);
					if (!accepted) {
						writeLine(dependencies.stdout, "Cancelled.");
						return;
					}
				}
				const result = await context.client.deleteArticle(id);
				if (context.options.json) {
					writeJson(dependencies.stdout, { ...result, articleId: id });
				} else {
					writeLine(dependencies.stdout, `Deleted article ${id}.`);
				}
			},
		);
}

function addListOptions(command: Command): Command {
	return command
		.option("--tag <name>", "Filter by tag name")
		.addOption(
			new Option("--sort <order>", "Sort order")
				.choices(["newest", "oldest", "title"])
				.default("newest"),
		)
		.option("--read", "Only read articles")
		.option("--unread", "Only unread articles")
		.option("--favorite", "Only favorite articles")
		.option("--limit <count>", "Articles per page", (value: string) =>
			positiveInteger(value, "--limit"),
		)
		.option("--page <number>", "Page number", (value: string) =>
			positiveInteger(value, "--page"),
		);
}

async function listArticles({
	command,
	localOptions,
	dependencies,
	search,
	forceFavorite,
}: {
	command: Command;
	localOptions: ListOptions;
	dependencies: RuntimeDependencies;
	search?: string;
	forceFavorite?: boolean;
}): Promise<void> {
	const context = await createAuthenticatedContext(command, dependencies);
	const { query, page } = await createListQuery({
		client: context.client,
		options: localOptions,
		search,
		forceFavorite,
	});
	const result = await context.client.listArticles(query);
	if (context.options.json) {
		writeJson(dependencies.stdout, result);
	} else {
		renderArticleList(dependencies.stdout, result, page);
	}
}

async function updateArticleState({
	command,
	dependencies,
	articleId,
	changes,
	humanMessage,
}: {
	command: Command;
	dependencies: RuntimeDependencies;
	articleId: string;
	changes: { isRead?: boolean; isFavorite?: boolean };
	humanMessage: string;
}): Promise<void> {
	const context = await createAuthenticatedContext(command, dependencies);
	const id = validateIdentifier(articleId);
	const result = await context.client.updateArticle(id, changes);
	if (context.options.json) {
		writeJson(dependencies.stdout, { ...result, articleId: id, ...changes });
	} else {
		writeLine(dependencies.stdout, humanMessage);
	}
}

async function mutateTag({
	command,
	dependencies,
	articleId,
	tagName,
	operation,
}: {
	command: Command;
	dependencies: RuntimeDependencies;
	articleId: string;
	tagName: string;
	operation: "add" | "remove";
}): Promise<void> {
	const context = await createAuthenticatedContext(command, dependencies);
	const id = validateIdentifier(articleId);
	const tag = resolveTag(await context.client.listTags(), tagName);
	const result =
		operation === "add"
			? await context.client.addTag(id, tag.id)
			: await context.client.removeTag(id, tag.id);
	if (context.options.json) {
		writeJson(dependencies.stdout, {
			...result,
			articleId: id,
			tag: { id: tag.id, name: tag.name },
			operation,
		});
	} else {
		writeLine(
			dependencies.stdout,
			`${operation === "add" ? "Added" : "Removed"} tag ${tag.name} ${operation === "add" ? "to" : "from"} article ${id}.`,
		);
	}
}
