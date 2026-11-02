import { readFile } from "node:fs/promises";
import { request as httpRequest } from "node:http";
import { stripTypeScriptTypes } from "node:module";
import { convertV4MiniflareOptions, Miniflare } from "miniflare";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

describe("request size boundary in Workers", () => {
	let runtime: Miniflare;
	let address: URL;

	beforeAll(async () => {
		const source = stripTypeScriptTypes(
			await readFile(new URL("./http-security.ts", import.meta.url), "utf8"),
		);
		runtime = new Miniflare(
			convertV4MiniflareOptions({
				modules: true,
				compatibilityDate: "2026-04-03",
				script: `${source}
export default {
	async fetch(request) {
		const bounded = await boundRequestBody(request);
		return bounded instanceof Response
			? bounded
			: Response.json({ method: bounded.method, body: await bounded.text() });
	}
};`,
			}),
		);
		address = await runtime.ready;
	});

	afterAll(async () => {
		await runtime?.dispose();
	});

	// Use HTTP rather than Node's Request, which cannot represent incoming GET/HEAD
	// bodies. Workerd also exposes a stream for Content-Length: 0 requests.
	function send(method: string, body: string, chunked = false) {
		return new Promise<{ status: number | undefined; body: string }>(
			(resolve, reject) => {
				const request = httpRequest(
					new URL("/api/v1/articles", address),
					{
						method,
						headers: chunked
							? { "Transfer-Encoding": "chunked" }
							: { "Content-Length": Buffer.byteLength(body) },
					},
					(response) => {
						let text = "";
						response.setEncoding("utf8");
						response.on("data", (chunk) => {
							text += chunk;
						});
						response.on("end", () =>
							resolve({ status: response.statusCode, body: text }),
						);
						response.on("error", reject);
					},
				);
				request.on("error", reject);
				request.end(body);
			},
		);
	}

	it.each(["GET", "HEAD"])(
		"accepts %s with an empty incoming stream",
		async (method) => {
			for (const chunked of [false, true]) {
				const response = await send(method, "", chunked);
				expect(response.status).toBe(200);
				if (method === "GET") {
					expect(JSON.parse(response.body)).toEqual({ method, body: "" });
				}
			}
		},
	);

	it.each(["GET", "HEAD"])(
		"rejects %s containing body data as a client error",
		async (method) => {
			for (const chunked of [false, true]) {
				const response = await send(method, "synthetic", chunked);
				expect(response.status).toBe(400);
			}
		},
	);

	it("still limits actual streaming bytes for GET requests", async () => {
		const response = await send("GET", "x".repeat(65537), true);
		expect(response.status).toBe(413);
	});

	it("preserves POST request bodies", async () => {
		const response = await send("POST", "synthetic");
		expect(response.status).toBe(200);
		expect(JSON.parse(response.body)).toEqual({
			method: "POST",
			body: "synthetic",
		});
	});
});
