import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { CloudflareClient, httpServerIntegration } from "@sentry/cloudflare";
import {
	BrowserClient,
	getCurrentScope,
	startInactiveSpan,
	withIsolationScope,
} from "@sentry/react";
import { describe, expect, it, vi } from "vitest";
import {
	getSentryPrivacyOptions,
	safeErrorDetails,
	sanitizeTelemetryUrl,
	sentryPrivacyIntegration,
} from "#/lib/sentry-privacy";

type Envelope = Parameters<
	ReturnType<
		NonNullable<ConstructorParameters<typeof BrowserClient>[0]["transport"]>
	>["send"]
>[0];

const PRIVATE = "SYNTHETIC_PRIVATE_MARKER";
const CAPABILITY = "SYNTHETIC_SHARE_CAPABILITY";
const privateUrl = `https://hold-shelf.com/share/${CAPABILITY}?code=${PRIVATE}#${PRIVATE}`;

describe("telemetry privacy", () => {
	it("keeps known route labels and never external reading URLs, capability paths or unknown paths", () => {
		expect(
			sanitizeTelemetryUrl(
				`/save?url=${encodeURIComponent(`https://private.example/${PRIVATE}`)}`,
			),
		).toBe("/save");
		expect(sanitizeTelemetryUrl(privateUrl)).toBe("/share/[redacted]");
		expect(sanitizeTelemetryUrl(`https://private.example/${PRIVATE}`)).toBe(
			"[external-url]",
		);
		expect(sanitizeTelemetryUrl(`/unknown/${PRIVATE}`)).toBe("[redacted]");
		expect(sanitizeTelemetryUrl(`/api/v1/articles/${PRIVATE}`)).toBe(
			"/api/v1/articles/[redacted]",
		);
	});

	for (const [name, Client] of [
		["browser", BrowserClient],
		["Cloudflare", CloudflareClient],
	] as const) {
		it(`scrubs actual ${name} event and streamed-span envelopes at a mock transport`, async () => {
			const envelopes: Envelope[] = [];
			const client = new Client({
				...getSentryPrivacyOptions(),
				dsn: "https://public@example.invalid/1",
				integrations: [sentryPrivacyIntegration()],
				stackParser: () => [],
				tracesSampleRate: 1,
				transport: () => ({
					send: (envelope) => {
						envelopes.push(envelope);
						return Promise.resolve({ statusCode: 200 });
					},
					flush: () => Promise.resolve(true),
				}),
			});
			client.init();
			await withIsolationScope(async (scope) => {
				const previousClient = getCurrentScope().getClient();
				getCurrentScope().setClient(client);
				try {
					scope.setUser({ id: PRIVATE, email: `${PRIVATE}@example.invalid` });
					scope.setExtra("input", { url: privateUrl, text: PRIVATE });
					scope.addBreadcrumb({
						category: "console",
						message: PRIVATE,
						data: { arguments: [privateUrl] },
					});
					scope.addBreadcrumb({
						category: "fetch",
						data: {
							url: privateUrl,
							method: "POST",
							status_code: 403,
							body: PRIVATE,
						},
					});
					client.captureEvent(
						{
							message: PRIVATE,
							request: {
								url: privateUrl,
								method: "POST",
								data: PRIVATE,
								cookies: { session: PRIVATE },
								headers: { cookie: PRIVATE },
								query_string: PRIVATE,
							},
							contexts: { custom: { private: PRIVATE } },
							tags: { private: PRIVATE },
							logentry: { message: PRIVATE, params: [PRIVATE] },
							exception: {
								values: [
									{
										type: "TypeError",
										value: `Failed fetching ${privateUrl}`,
										stacktrace: {
											frames: [
												{
													filename: `https://hold-shelf.com/assets/app-a1b2.js?secret=${PRIVATE}`,
													function: "loadArticle",
													lineno: 42,
													colno: 7,
													vars: { text: PRIVATE },
													context_line: PRIVATE,
												},
											],
										},
									},
								],
							},
						},
						{},
						scope,
					);
					const span = startInactiveSpan({
						name: `GET ${privateUrl}`,
						op: "http.client",
						attributes: {
							"url.full": privateUrl,
							"http.request.method": "POST",
							"http.response.status_code": 403,
							"db.query.text": PRIVATE,
							private: PRIVATE,
						},
					});
					span.end();
					await client.flush(2000);
				} finally {
					getCurrentScope().setClient(previousClient);
				}
			});
			await client.close();
			const serialized = JSON.stringify(envelopes);
			expect(serialized).not.toContain(PRIVATE);
			expect(serialized).not.toContain(CAPABILITY);
			expect(serialized).toContain("TypeError");
			expect(serialized).toContain("loadArticle");
			expect(serialized).toContain("app-a1b2.js");
			expect(serialized).toContain('"lineno":42');
			expect(serialized).toContain("/share/[redacted]");
			expect(serialized).toContain('"type":"span"');
			expect(serialized).toContain("http.client");
			expect(serialized).toContain("403");
		});
	}

	it("disables actual Cloudflare request-body capture before any clone or read", async () => {
		const require = createRequire(import.meta.url);
		const sdkPath = dirname(require.resolve("@sentry/cloudflare/package.json"));
		const captureModule = pathToFileURL(
			join(sdkPath, "build/esm/prod/integrations/httpServer.js"),
		).href;
		const { captureIncomingRequestBody } = await import(
			/* @vite-ignore */ captureModule
		);
		const client = new CloudflareClient({
			...getSentryPrivacyOptions(),
			dsn: "https://public@example.invalid/1",
			integrations: [httpServerIntegration(), sentryPrivacyIntegration()],
			stackParser: () => [],
			transport: () => ({
				send: () => Promise.resolve({ statusCode: 200 }),
				flush: () => Promise.resolve(true),
			}),
		});
		client.init();
		const request = new Request(privateUrl, { method: "POST", body: PRIVATE });
		const clone = vi.spyOn(request, "clone");
		await captureIncomingRequestBody(client, request);
		expect(clone).not.toHaveBeenCalled();
		expect(request.bodyUsed).toBe(false);
		expect(client.getDataCollectionOptions().httpBodies).toEqual([]);
		await client.close();
	});

	it("provides useful fixed log diagnostics without stringifying an untrusted error", () => {
		expect(safeErrorDetails(new TypeError(privateUrl))).toEqual({
			errorType: "TypeError",
		});
		const error = new Error(PRIVATE);
		error.name = PRIVATE;
		expect(safeErrorDetails(error)).toEqual({ errorType: "Error" });
		expect(
			safeErrorDetails({
				toString: () => {
					throw new Error("must not stringify");
				},
			}),
		).toEqual({ errorType: "Error" });
	});
});
