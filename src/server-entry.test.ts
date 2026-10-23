import { describe, expect, it, vi } from "vitest";

const { fetchHandler, captureException } = vi.hoisted(() => ({
	fetchHandler: vi.fn(),
	captureException: vi.fn(),
}));
vi.mock("@tanstack/react-start/server-entry", () => ({
	default: { fetch: fetchHandler },
}));
vi.mock("@sentry/cloudflare", () => ({
	captureException,
	withSentry: (_options: unknown, handler: unknown) => handler,
}));

import worker from "./server-entry";

const env = {} as Cloudflare.Env;
const ctx = { waitUntil: vi.fn() } as unknown as ExecutionContext;

describe("Worker security boundary", () => {
	it("rejects oversized bodies before calling the framework", async () => {
		const response = await worker.fetch(
			new Request("https://hold-shelf.com/api/extension/articles", {
				method: "POST",
				body: "x".repeat(65537),
			}),
			env,
			ctx,
		);
		expect(response.status).toBe(413);
		expect(fetchHandler).not.toHaveBeenCalled();
		expect(response.headers.get("Cache-Control")).toBe("private, no-store");
	});

	it("preserves framework response body and adds headers", async () => {
		fetchHandler.mockResolvedValue(new Response("html"));
		const response = await worker.fetch(
			new Request("https://hold-shelf.com/app/home"),
			env,
			ctx,
		);
		expect(response.status).toBe(200);
		expect(await response.text()).toBe("html");
		expect(response.headers.get("X-Frame-Options")).toBe("DENY");
	});

	it("protects unexpected errors without exposing error details", async () => {
		const failure = new Error("Synthetic private detail");
		fetchHandler.mockRejectedValue(failure);
		const response = await worker.fetch(
			new Request("https://hold-shelf.com/app/home"),
			env,
			ctx,
		);
		expect(response.status).toBe(500);
		expect(await response.text()).not.toContain(failure.message);
		expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
		expect(captureException).toHaveBeenCalledWith(failure);
	});
});
