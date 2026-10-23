import { describe, expect, it, vi } from "vitest";
import { extractArticleContent } from "#/server/article-content";
import { scheduleBackground, withBackgroundContext } from "#/server/background";
import { extractMetadata } from "#/server/metadata";

describe("private article failure logs", () => {
	it("retains failure codes but omits private URLs and raw network error text", async () => {
		const secret = "SYNTHETIC_PRIVATE_ARTICLE";
		const url = `https://example.com/${secret}?invite=${secret}`;
		vi.spyOn(globalThis, "fetch").mockRejectedValue(
			new TypeError(`Fetch failed: ${url}`),
		);
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		expect((await extractMetadata(url)).hostname).toBe("example.com");
		expect((await extractArticleContent(url)).status).toBe("unavailable");
		const logs = JSON.stringify(warn.mock.calls);
		expect(warn).toHaveBeenCalledTimes(2);
		expect(logs).not.toContain(secret);
		expect(logs).not.toContain("example.com");
		expect(logs).toContain("METADATA_EXTRACTION_FAILED");
		expect(logs).toContain("ARTICLE_CONTENT_EXTRACTION_FAILED");
		expect(logs).toContain("TypeError");
	});

	it("does not log raw errors from failed background tasks", async () => {
		const error = vi.spyOn(console, "error").mockImplementation(() => {});
		const pending: Promise<unknown>[] = [];
		withBackgroundContext(
			{ waitUntil: (promise) => pending.push(promise) },
			() => {
				expect(
					scheduleBackground(async () => {
						throw new Error("SYNTHETIC_PRIVATE_BODY");
					}),
				).toBe(true);
			},
		);
		await Promise.all(pending);
		expect(error).toHaveBeenCalledOnce();
		expect(JSON.stringify(error.mock.calls)).not.toContain(
			"SYNTHETIC_PRIVATE_BODY",
		);
		expect(JSON.stringify(error.mock.calls)).toContain(
			"BACKGROUND_CAPTURE_FAILED",
		);
	});
});
