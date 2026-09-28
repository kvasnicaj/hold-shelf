import {
	type ArticleListQuery,
	type ArticleListResponse,
	type ArticleReaderResponse,
	articleListResponseSchema,
	articleReaderResponseSchema,
	type CreateArticleResponse,
	createArticleResponseSchema,
	type DashboardResponse,
	dashboardResponseSchema,
	type MeResponse,
	meResponseSchema,
	type SuccessResponse,
	successResponseSchema,
	type TagsResponse,
	tagsResponseSchema,
	type UpdateArticleRequest,
} from "@hold-shelf/api-contracts";
import {
	AuthenticationError,
	CliError,
	NotFoundError,
	TemporaryError,
	UsageError,
} from "../errors.js";
import { redactSecrets } from "../helpers.js";

const CLI_VERSION = "0.1.0";

type ResponseSchema<T> = {
	safeParse: (
		value: unknown,
	) => { success: true; data: T } | { success: false; error: unknown };
};

export class ApiClient {
	readonly server: string;
	readonly token: string;
	readonly timeout: number;
	readonly fetchImplementation: typeof fetch;

	constructor({
		server,
		token,
		timeout,
		fetchImplementation,
	}: {
		server: string;
		token: string;
		timeout: number;
		fetchImplementation: typeof fetch;
	}) {
		this.server = server;
		this.token = token;
		this.timeout = timeout;
		this.fetchImplementation = fetchImplementation;
	}

	me(): Promise<MeResponse> {
		return this.request("GET", "api/v1/me", meResponseSchema);
	}

	listArticles(query: ArticleListQuery = {}): Promise<ArticleListResponse> {
		const search = new URLSearchParams();
		for (const [key, value] of Object.entries(query)) {
			if (value !== undefined) {
				search.set(key, String(value));
			}
		}
		const suffix = search.size > 0 ? `?${search.toString()}` : "";
		return this.request(
			"GET",
			`api/v1/articles${suffix}`,
			articleListResponseSchema,
		);
	}

	getArticle(id: string): Promise<ArticleReaderResponse> {
		return this.request(
			"GET",
			`api/v1/articles/${encodeURIComponent(id)}`,
			articleReaderResponseSchema,
		);
	}

	createArticle(url: string): Promise<CreateArticleResponse> {
		return this.request(
			"POST",
			"api/v1/articles",
			createArticleResponseSchema,
			{ url },
		);
	}

	updateArticle(
		id: string,
		changes: UpdateArticleRequest,
	): Promise<SuccessResponse> {
		return this.request(
			"PATCH",
			`api/v1/articles/${encodeURIComponent(id)}`,
			successResponseSchema,
			changes,
		);
	}

	deleteArticle(id: string): Promise<SuccessResponse> {
		return this.request(
			"DELETE",
			`api/v1/articles/${encodeURIComponent(id)}`,
			successResponseSchema,
		);
	}

	addTag(id: string, tagId: string): Promise<SuccessResponse> {
		return this.request(
			"PUT",
			`api/v1/articles/${encodeURIComponent(id)}/tags/${encodeURIComponent(tagId)}`,
			successResponseSchema,
		);
	}

	removeTag(id: string, tagId: string): Promise<SuccessResponse> {
		return this.request(
			"DELETE",
			`api/v1/articles/${encodeURIComponent(id)}/tags/${encodeURIComponent(tagId)}`,
			successResponseSchema,
		);
	}

	listTags(): Promise<TagsResponse> {
		return this.request("GET", "api/v1/tags", tagsResponseSchema);
	}

	dashboard(): Promise<DashboardResponse> {
		return this.request("GET", "api/v1/dashboard", dashboardResponseSchema);
	}

	private async request<T>(
		method: string,
		path: string,
		schema: ResponseSchema<T>,
		body?: unknown,
	): Promise<T> {
		const controller = new AbortController();
		let timedOut = false;
		let timeoutId: ReturnType<typeof setTimeout> | undefined;
		const timeout = new Promise<never>((_resolve, reject) => {
			timeoutId = setTimeout(() => {
				timedOut = true;
				controller.abort();
				reject(new Error("Request timed out."));
			}, this.timeout);
		});

		try {
			return await Promise.race([
				this.performRequest({ method, path, schema, body, controller }),
				timeout,
			]);
		} catch (error) {
			if (error instanceof CliError) {
				throw error;
			}
			throw new TemporaryError(
				timedOut
					? `Request timed out after ${this.timeout} ms.`
					: `Could not reach ${this.server}: ${redactSecrets(error instanceof Error ? error.message : error)}`,
				timedOut ? "REQUEST_TIMEOUT" : "NETWORK_ERROR",
			);
		} finally {
			if (timeoutId !== undefined) {
				clearTimeout(timeoutId);
			}
		}
	}

	private async performRequest<T>({
		method,
		path,
		schema,
		body,
		controller,
	}: {
		method: string;
		path: string;
		schema: ResponseSchema<T>;
		body?: unknown;
		controller: AbortController;
	}): Promise<T> {
		const response = await this.fetchImplementation(
			new URL(path, `${this.server}/`),
			{
				method,
				redirect: "manual",
				signal: controller.signal,
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${this.token}`,
					"User-Agent": `hold-shelf-cli/${CLI_VERSION}`,
					...(body === undefined ? {} : { "Content-Type": "application/json" }),
				},
				body: body === undefined ? undefined : JSON.stringify(body),
			},
		);

		if (response.status >= 300 && response.status < 400) {
			throw new TemporaryError(
				"The server returned a redirect. Credentialed requests do not follow redirects.",
				"REDIRECT_REFUSED",
			);
		}

		const data = await readJson(response);
		if (!response.ok) {
			throw mapApiError(response.status, data, response.headers);
		}

		const result = schema.safeParse(data);
		if (!result.success) {
			throw new CliError(
				"The server returned an unexpected response. Check that the CLI and server versions are compatible.",
				1,
				"INVALID_SERVER_RESPONSE",
			);
		}
		return result.data;
	}
}

async function readJson(response: Response): Promise<unknown> {
	try {
		return await response.json();
	} catch {
		if (response.ok) {
			throw new CliError(
				"The server returned a non-JSON response.",
				1,
				"INVALID_SERVER_RESPONSE",
			);
		}
		return null;
	}
}

function mapApiError(
	status: number,
	data: unknown,
	headers: Headers,
): CliError {
	const parsed = parseApiError(data);
	const message = redactSecrets(
		parsed?.message ?? `Request failed (${status}).`,
	);
	const code = parsed?.code ?? `HTTP_${status}`;

	if (status === 400 || status === 422) {
		return new UsageError(message);
	}
	if (status === 401 || status === 403) {
		return new AuthenticationError(message);
	}
	if (status === 404) {
		return new NotFoundError(message);
	}
	if (status === 408 || status === 429 || status >= 500) {
		const retryAfter = headers.get("retry-after");
		return new TemporaryError(
			retryAfter ? `${message} Retry after ${retryAfter} seconds.` : message,
			code,
		);
	}
	return new CliError(message, 1, code);
}

function parseApiError(
	value: unknown,
): { code: string; message: string } | null {
	if (typeof value !== "object" || value === null || Array.isArray(value)) {
		return null;
	}
	const code = Reflect.get(value, "code");
	const message = Reflect.get(value, "message");
	return typeof code === "string" && typeof message === "string"
		? { code, message }
		: null;
}
