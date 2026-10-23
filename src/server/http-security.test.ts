import { describe, expect, it } from "vitest";
import { boundRequestBody, withSecurityHeaders } from "#/server/http-security";

describe("request size boundary", () => {
	it("preserves a valid body and authentication headers before deserialization", async () => {
		const request = new Request("https://hold-shelf.com/api/v1/articles", {
			method: "POST",
			body: JSON.stringify({ url: "https://example.com/článek" }),
			headers: {
				"Content-Type": "application/json",
				Authorization: "Bearer synthetic",
			},
		});
		const bounded = await boundRequestBody(request);
		expect(bounded).toBeInstanceOf(Request);
		if (!(bounded instanceof Request)) throw new Error("Expected request");
		expect(bounded.headers.get("Authorization")).toBe("Bearer synthetic");
		expect(await bounded.json()).toEqual({ url: "https://example.com/článek" });
	});

	it("rejects excessive Content-Length before reading the stream", async () => {
		const request = new Request(
			"https://hold-shelf.com/api/extension/articles",
			{
				method: "POST",
				body: "{}",
				headers: { "Content-Length": "65537" },
			},
		);
		const bounded = await boundRequestBody(request);
		expect(bounded).toBeInstanceOf(Response);
		expect((bounded as Response).status).toBe(413);
	});

	it.each([undefined, "1"])(
		"bounds actual streaming bytes despite Content-Length %s",
		async (length) => {
			const request = new Request(
				"https://hold-shelf.com/api/auth/sign-in/social",
				{
					method: "POST",
					body: "a".repeat(65537),
					headers: length ? { "Content-Length": length } : undefined,
				},
			);
			const bounded = await boundRequestBody(request);
			expect((bounded as Response).status).toBe(413);
		},
	);

	it("permits import overhead within 10 MiB but rejects larger RPC bodies", async () => {
		for (const size of [100_000, 10 * 1024 * 1024 + 1]) {
			const bounded = await boundRequestBody(
				new Request("https://hold-shelf.com/_serverFn/import", {
					method: "POST",
					body: "a".repeat(size),
				}),
			);
			if (size === 100_000) {
				expect(bounded).toBeInstanceOf(Request);
			} else {
				expect((bounded as Response).status).toBe(413);
			}
		}
	});

	it("does not alter bodyless requests", async () => {
		const request = new Request("https://hold-shelf.com/");
		expect(await boundRequestBody(request)).toBe(request);
	});
});

describe("HTTP response security policy", () => {
	it.each([200, 302, 401, 404, 413, 500])(
		"protects dynamic responses with status %s",
		(status) => {
			const request = new Request("https://hold-shelf.com/_serverFn/token");
			const response = withSecurityHeaders(
				new Response(null, { status }),
				request,
			);
			expect(response.status).toBe(status);
			expect(response.headers.get("Cache-Control")).toBe("private, no-store");
			expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
			expect(response.headers.get("X-Frame-Options")).toBe("DENY");
			expect(response.headers.get("Referrer-Policy")).toBe("no-referrer");
			expect(response.headers.get("Content-Security-Policy")).toContain(
				"frame-ancestors 'none'",
			);
			expect(
				response.headers.get("Content-Security-Policy-Report-Only"),
			).toContain("script-src 'self'");
			// HSTS needs an explicit staged production rollout, not a blanket code default.
			expect(response.headers.get("Strict-Transport-Security")).toBeNull();
		},
	);

	it("preserves redirects, multiple cookies, stricter CSP and response body", async () => {
		const original = new Response("body", {
			status: 302,
			headers: {
				Location: "/login",
				"Content-Security-Policy": "script-src 'nonce-test'",
				"CDN-Cache-Control": "public,max-age=100",
			},
		});
		original.headers.append("Set-Cookie", "state=synthetic; Secure; HttpOnly");
		original.headers.append(
			"Set-Cookie",
			"session=synthetic; Secure; HttpOnly",
		);
		const response = withSecurityHeaders(
			original,
			new Request("https://hold-shelf.com/app/home"),
		);
		expect(response.headers.get("Location")).toBe("/login");
		expect(response.headers.getSetCookie()).toHaveLength(2);
		expect(response.headers.get("Content-Security-Policy")).toContain(
			"script-src 'nonce-test'",
		);
		expect(response.headers.get("CDN-Cache-Control")).toBeNull();
		expect(await response.text()).toBe("body");
	});

	it("retains immutable public asset caching but never caches authenticated asset responses", () => {
		for (const authenticated of [false, true]) {
			const response = withSecurityHeaders(
				new Response("asset", {
					headers: {
						"Cache-Control": "public, max-age=31536000, immutable",
					},
				}),
				new Request("https://hold-shelf.com/assets/router-hash.js", {
					headers: authenticated ? { Cookie: "session=synthetic" } : undefined,
				}),
			);
			expect(response.headers.get("Cache-Control")).toBe(
				authenticated
					? "private, no-store"
					: "public, max-age=31536000, immutable",
			);
		}
	});
});
