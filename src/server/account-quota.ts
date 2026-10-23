/** Keep these limits synchronized with drizzle/0010_account_quotas.sql. */
export const ACCOUNT_QUOTAS = {
	articles: 10_000,
	tags: 1_000,
	storageBytes: 250 * 1024 * 1024,
	articleTags: 100,
} as const;

const quotaMessages = {
	ACCOUNT_ARTICLE_QUOTA:
		"Your library has reached 10,000 articles, including Trash. Permanently delete articles to make room.",
	ACCOUNT_TAG_QUOTA:
		"Your library has reached 1,000 tags. Delete unused tags to make room.",
	ACCOUNT_STORAGE_QUOTA:
		"Your library has reached its 250 MiB storage limit. Permanently delete articles to make room.",
	ACCOUNT_ARTICLE_TAG_QUOTA: "An article can have at most 100 tags.",
} as const;

export class AccountQuotaError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "AccountQuotaError";
	}
}

/** Drizzle and D1 wrap the SQLite trigger error in nested causes. Never expose SQL. */
export function rethrowQuotaError(error: unknown): never {
	let current = error;
	const visited = new Set<unknown>();
	while (current instanceof Error && !visited.has(current)) {
		visited.add(current);
		for (const [code, message] of Object.entries(quotaMessages)) {
			if (new RegExp(`^(?:D1_ERROR: )?${code}(?::|$)`).test(current.message))
				throw new AccountQuotaError(message);
		}
		current = current.cause;
	}
	throw error;
}

export async function withQuotaErrors<T>(
	operation: () => Promise<T>,
): Promise<T> {
	try {
		return await operation();
	} catch (error) {
		return rethrowQuotaError(error);
	}
}
