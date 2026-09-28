import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import type { CredentialStore } from "./auth/credential-store.js";
import { runCli } from "./cli.js";
import type {
	CliEnvironment,
	CliInput,
	RuntimeDependencies,
	Writer,
} from "./types.js";

const TOKEN = `hs_${"a".repeat(43)}`;
const DATE = "2026-08-30T12:00:00.000Z";

describe("Hold Shelf CLI", () => {
	it("maps list filters and writes JSON only to stdout", async () => {
		const calls: Array<{ url: URL; init?: RequestInit }> = [];
		const dependencies = createDependencies({
			fetch: async (input, init) => {
				calls.push({ url: new URL(String(input)), init });
				return jsonResponse({
					items: [articleFixture()],
					total: 1,
				});
			},
		});

		const exitCode = await runCli(
			[
				"node",
				"hold-shelf",
				"--json",
				"articles",
				"list",
				"--unread",
				"--sort",
				"title",
				"--limit",
				"5",
				"--page",
				"3",
			],
			dependencies.runtime,
		);

		expect(exitCode).toBe(0);
		expect(JSON.parse(dependencies.stdout.value)).toMatchObject({ total: 1 });
		expect(dependencies.stderr.value).toBe("");
		expect(calls[0]?.url.searchParams.get("isRead")).toBe("false");
		expect(calls[0]?.url.searchParams.get("sort")).toBe("title");
		expect(calls[0]?.url.searchParams.get("limit")).toBe("5");
		expect(calls[0]?.url.searchParams.get("offset")).toBe("10");
		expect(new Headers(calls[0]?.init?.headers).get("authorization")).toBe(
			`Bearer ${TOKEN}`,
		);
	});

	it("resolves every tag before creating and resumes assignments for duplicates", async () => {
		const calls: Array<{ url: URL; method: string }> = [];
		const dependencies = createDependencies({
			fetch: async (input, init) => {
				const url = new URL(String(input));
				const method = init?.method ?? "GET";
				calls.push({ url, method });
				if (url.pathname === "/api/v1/tags") {
					return jsonResponse([
						{
							id: "tag-work",
							name: "Work",
							color: null,
							createdAt: DATE,
							articleCount: 2,
						},
						{
							id: "tag-two",
							name: "Later",
							color: null,
							createdAt: DATE,
							articleCount: 1,
						},
					]);
				}
				if (url.pathname === "/api/v1/articles" && method === "POST") {
					return jsonResponse({
						status: "exists",
						message: "Already saved",
						article: {
							id: "duplicate-article",
							url: "https://example.com",
						},
					});
				}
				return jsonResponse({ success: true });
			},
		});

		const exitCode = await runCli(
			[
				"node",
				"hold-shelf",
				"--json",
				"articles",
				"add",
				"https://example.com",
				"--tag",
				"Work",
				"--tag",
				"tag-two",
			],
			dependencies.runtime,
		);

		expect(exitCode).toBe(0);
		expect(calls.map(({ url, method }) => `${method} ${url.pathname}`)).toEqual(
			[
				"GET /api/v1/tags",
				"POST /api/v1/articles",
				"PUT /api/v1/articles/duplicate-article/tags/tag-work",
				"PUT /api/v1/articles/duplicate-article/tags/tag-two",
			],
		);
		expect(JSON.parse(dependencies.stdout.value)).toMatchObject({
			status: "exists",
			article: { id: "duplicate-article" },
			assignedTags: [{ id: "tag-work" }, { id: "tag-two" }],
		});
	});

	it("does not create an article when any requested tag is unknown", async () => {
		const fetch = vi.fn(async () => jsonResponse([]));
		const dependencies = createDependencies({ fetch });

		const exitCode = await runCli(
			[
				"node",
				"hold-shelf",
				"articles",
				"add",
				"https://example.com/path",
				"--tag",
				"Missing",
			],
			dependencies.runtime,
		);

		expect(exitCode).toBe(4);
		expect(fetch).toHaveBeenCalledTimes(1);
		expect(dependencies.stderr.value).toContain("Tag not found");
	});

	it("refuses excessive timeout values before making a request", async () => {
		const fetch = vi.fn();
		const dependencies = createDependencies({ fetch });

		const exitCode = await runCli(
			["node", "hold-shelf", "--timeout", "300001", "auth", "status"],
			dependencies.runtime,
		);

		expect(exitCode).toBe(2);
		expect(fetch).not.toHaveBeenCalled();
		expect(dependencies.stderr.value).toContain(
			"--timeout cannot be greater than 300000",
		);
	});

	it("applies the timeout while reading the response body", async () => {
		const dependencies = createDependencies({
			fetch: async () =>
				new Response(
					new ReadableStream({
						pull: () => new Promise(() => undefined),
					}),
					{ headers: { "content-type": "application/json" } },
				),
		});

		const exitCode = await runCli(
			["node", "hold-shelf", "--timeout", "5", "auth", "status"],
			dependencies.runtime,
		);

		expect(exitCode).toBe(5);
		expect(dependencies.stderr.value).toContain(
			"Request timed out after 5 ms.",
		);
	});

	it("never falls back to plaintext when secure login storage is unavailable", async () => {
		const configHome = await mkdtemp(join(tmpdir(), "hold-shelf-cli-test-"));
		const dependencies = createDependencies({
			env: { HOLD_SHELF_CONFIG_HOME: configHome },
			stdin: inputFrom(TOKEN),
			fetch: async () => jsonResponse({ authenticated: true }),
			createCredentialStore: async () => {
				throw new Error("keyring unavailable");
			},
		});

		const exitCode = await runCli(
			["node", "hold-shelf", "auth", "login", "--token-stdin"],
			dependencies.runtime,
		);

		expect(exitCode).toBe(3);
		expect(dependencies.stderr.value).not.toContain(TOKEN);
		await expect(
			readFile(join(configHome, "config.json")),
		).rejects.toMatchObject({
			code: "ENOENT",
		});
	});

	it("refuses redirects and does not reveal the credential", async () => {
		const dependencies = createDependencies({
			fetch: async () =>
				new Response(null, {
					status: 302,
					headers: { location: "https://attacker.invalid/api/v1/me" },
				}),
		});

		const exitCode = await runCli(
			["node", "hold-shelf", "auth", "status"],
			dependencies.runtime,
		);

		expect(exitCode).toBe(5);
		expect(dependencies.stderr.value).toContain("do not follow redirects");
		expect(dependencies.stderr.value).not.toContain(TOKEN);
	});
});

function createDependencies({
	env = { HOLD_SHELF_TOKEN: TOKEN },
	stdin = inputFrom(""),
	fetch,
	createCredentialStore = async () => memoryCredentialStore(),
}: {
	env?: CliEnvironment;
	stdin?: CliInput;
	fetch: typeof globalThis.fetch;
	createCredentialStore?: () => Promise<CredentialStore>;
}) {
	const stdout = memoryWriter();
	const stderr = memoryWriter();
	const runtime: RuntimeDependencies = {
		env,
		stdin,
		stdout,
		stderr,
		fetch,
		createCredentialStore,
		promptForToken: async () => TOKEN,
		confirm: async () => true,
	};
	return { runtime, stdout, stderr };
}

function memoryWriter(): Writer & { isTTY: boolean; value: string } {
	return {
		isTTY: false,
		value: "",
		write(value) {
			this.value += value;
		},
	};
}

function inputFrom(value: string): CliInput {
	return {
		isTTY: false,
		async *[Symbol.asyncIterator]() {
			yield value;
		},
	};
}

function memoryCredentialStore(): CredentialStore {
	return {
		get: async () => null,
		set: async () => undefined,
		delete: async () => false,
	};
}

function jsonResponse(value: unknown, status = 200): Response {
	return Response.json(value, { status });
}

function articleFixture() {
	return {
		id: "article-1",
		url: "https://example.com/story",
		title: "Story",
		description: null,
		hostname: "example.com",
		faviconUrl: null,
		isRead: false,
		isFavorite: false,
		createdAt: DATE,
		updatedAt: DATE,
		readAt: null,
		tags: [],
	};
}
