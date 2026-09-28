import type { ArticleListQuery, TagsResponse } from "@hold-shelf/api-contracts";
import type { Command } from "commander";
import { getAuthenticatedClient } from "../auth/helpers.js";
import { resolveServerUrl } from "../config/config.js";
import { NotFoundError, UsageError } from "../errors.js";
import type { GlobalOptions, RuntimeDependencies } from "../types.js";

export type ListOptions = {
	tag?: string;
	sort?: "newest" | "oldest" | "title";
	read?: boolean;
	unread?: boolean;
	favorite?: boolean;
	limit?: number;
	page?: number;
};

export function getGlobalOptions(
	command: Command,
	dependencies: RuntimeDependencies,
): GlobalOptions {
	const values = command.optsWithGlobals<{
		json?: boolean;
		server?: string;
		timeout?: number;
		color?: boolean;
	}>();
	return {
		json: values.json ?? false,
		server: values.server,
		timeout: values.timeout ?? 15_000,
		color: (values.color ?? true) && dependencies.env.NO_COLOR === undefined,
	};
}

export async function createAuthenticatedContext(
	command: Command,
	dependencies: RuntimeDependencies,
) {
	const options = getGlobalOptions(command, dependencies);
	const server = await resolveServerUrl({
		commandValue: options.server,
		env: dependencies.env,
	});
	const authenticated = await getAuthenticatedClient({
		server,
		options,
		dependencies,
	});
	return { ...authenticated, options, server };
}

export async function createListQuery({
	client,
	options,
	search,
	forceFavorite,
}: {
	client: Awaited<ReturnType<typeof createAuthenticatedContext>>["client"];
	options: ListOptions;
	search?: string;
	forceFavorite?: boolean;
}): Promise<{ query: ArticleListQuery; page: number }> {
	if (options.read && options.unread) {
		throw new UsageError("--read and --unread cannot be used together.");
	}
	const limit = options.limit ?? 20;
	const page = options.page ?? 1;
	const offset = (page - 1) * limit;
	if (limit > 100) {
		throw new UsageError("--limit cannot be greater than 100.");
	}
	if (offset > 10_000) {
		throw new UsageError(
			"The requested page is beyond the API pagination limit.",
		);
	}

	let tagId: string | undefined;
	if (options.tag !== undefined) {
		tagId = resolveTag(await client.listTags(), options.tag).id;
	}

	return {
		page,
		query: {
			isRead: options.read ? true : options.unread ? false : undefined,
			isFavorite: forceFavorite || options.favorite ? true : undefined,
			tagId,
			search: normalizeSearch(search),
			sort: options.sort,
			limit,
			offset,
		},
	};
}

export function resolveTag(tags: TagsResponse, name: string) {
	const normalized = name.trim();
	if (!normalized || normalized.length > 128) {
		throw new UsageError(
			"Tag name or id must contain between 1 and 128 characters.",
		);
	}
	const byId = tags.find((tag) => tag.id === normalized);
	if (byId) {
		return byId;
	}
	if (normalized.length > 64) {
		throw new NotFoundError(`Tag not found: ${normalized}`);
	}
	const exact = tags.find((tag) => tag.name === normalized);
	if (exact) {
		return exact;
	}
	const insensitive = tags.filter(
		(tag) => tag.name.toLocaleLowerCase() === normalized.toLocaleLowerCase(),
	);
	if (insensitive.length === 1 && insensitive[0]) {
		return insensitive[0];
	}
	if (insensitive.length > 1) {
		throw new UsageError(
			`Tag name is ambiguous: ${normalized}. Use the exact tag name or tag id.`,
		);
	}
	throw new NotFoundError(`Tag not found: ${normalized}`);
}

function normalizeSearch(value?: string): string | undefined {
	if (value === undefined) {
		return undefined;
	}
	const normalized = value.trim();
	if (!normalized) {
		throw new UsageError("Search query cannot be empty.");
	}
	if (normalized.length > 200) {
		throw new UsageError("Search query cannot exceed 200 characters.");
	}
	return normalized;
}
