import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("#/lib/sentry-environment", () => ({
	isProductionSentryHostname: () => true,
}));

let allowed = false;
let sentry: typeof import("@sentry/react") | undefined;

afterEach(async () => {
	allowed = false;
	await sentry?.close(0);
});

describe("browser monitoring consent export gate", () => {
	it("does not initialize without consent and blocks real SDK exports after withdrawal", async () => {
		const fetch = vi.fn().mockResolvedValue(new Response("", { status: 200 }));
		vi.stubGlobal("fetch", fetch);
		sentry = await import("@sentry/react");
		const { initSentry } = await import("#/lib/sentry");
		initSentry(() => allowed);
		expect(sentry.getClient()).toBeUndefined();
		expect(fetch).not.toHaveBeenCalled();

		allowed = true;
		initSentry(() => allowed);
		const client = sentry.getClient();
		expect(client).toBeDefined();
		sentry.captureException(new Error("synthetic browser diagnostic"));
		await client?.flush();
		expect(fetch).toHaveBeenCalled();
		const acceptedSends = fetch.mock.calls.length;

		allowed = false;
		sentry.captureException(
			new TypeError("synthetic post-withdrawal diagnostic"),
		);
		await client?.flush();
		// Exercise a background batch too, not just beforeSend/error handling.
		const transport = client?.getTransport();
		await transport?.send([
			{},
			[
				[
					{
						type: "span",
						item_count: 1,
						content_type: "application/vnd.sentry.items.span.v2+json",
					},
					{
						items: [
							{
								name: "synthetic-span",
								trace_id: "0".repeat(32),
								span_id: "0".repeat(16),
								start_timestamp: 1,
								end_timestamp: 2,
								status: "ok",
								is_segment: true,
								attributes: {},
							},
						],
					},
				],
			],
		]);
		expect(fetch).toHaveBeenCalledTimes(acceptedSends);
	});
});
