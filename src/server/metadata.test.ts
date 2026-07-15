import { beforeEach, describe, expect, it, vi } from "vitest";

import { extractMetadata } from "#/server/metadata";

describe("extractMetadata", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("extracts metadata from HTML responses", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(
				`
					<html>
						<head>
							<title>Readable title</title>
							<meta name="description" content="Useful summary" />
							<link rel="icon" href="/favicon.ico" />
						</head>
					</html>
				`,
				{
					status: 200,
					headers: {
						"content-type": "text/html; charset=utf-8",
					},
				},
			),
		);

		const metadata = await extractMetadata("https://example.com/path");
		expect(metadata).toEqual({
			title: "Readable title",
			description: "Useful summary",
			faviconUrl: "https://example.com/favicon.ico",
			hostname: "example.com",
		});
	});

	it("extracts X Article metadata from a public seed post", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(
				`
					<html>
						<head>
							<title>Alvin Sng on X: &quot;https://t.co/example&quot; / X</title>
							<meta name="description" content="https://t.co/example" />
							<link rel="icon" href="/favicon.ico" />
						</head>
						<body>
							<script>
								entity={__typename:"ArticleEntity",rest_id:"2077106065959989248",title:"Why we stopped using SDKs",preview_text:"We call REST APIs directly through a small wrapper &amp; keep the contract explicit.",cover_media_results:null}
							</script>
						</body>
					</html>
				`,
				{
					status: 200,
					headers: { "content-type": "text/html; charset=utf-8" },
				},
			),
		);

		const metadata = await extractMetadata(
			"https://x.com/alvinsng/status/2077114275412512868?s=20",
		);

		expect(metadata).toEqual({
			title: "Why we stopped using SDKs",
			description:
				"We call REST APIs directly through a small wrapper & keep the contract explicit.",
			faviconUrl: "https://x.com/favicon.ico",
			hostname: "x.com",
		});
	});

	it("returns fallback metadata for non-html responses", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response("{}", {
				status: 200,
				headers: {
					"content-type": "application/json",
				},
			}),
		);

		const metadata = await extractMetadata("https://example.com/path");
		expect(metadata.title).toBe("example.com");
		expect(metadata.hostname).toBe("example.com");
		expect(metadata.faviconUrl).toContain("google.com/s2/favicons");
	});

	it("returns fallback metadata when redirect target is blocked", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(null, {
				status: 302,
				headers: {
					location: "http://127.0.0.1/internal",
				},
			}),
		);

		const metadata = await extractMetadata("https://example.com/redirect");
		expect(metadata.title).toBe("example.com");
		expect(metadata.hostname).toBe("example.com");
	});

	it("follows redirects to a valid HTML target", async () => {
		const fetchMock = vi.spyOn(globalThis, "fetch");
		fetchMock
			.mockResolvedValueOnce(
				new Response(null, {
					status: 302,
					headers: {
						location: "/final",
					},
				}),
			)
			.mockResolvedValueOnce(
				new Response("<title>Final title</title>", {
					status: 200,
					headers: {
						"content-type": "text/html",
					},
				}),
			);

		const metadata = await extractMetadata("https://example.com/start");
		expect(metadata.title).toBe("Final title");
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});

	it("returns fallback metadata when the response is too large", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response("<html></html>", {
				status: 200,
				headers: {
					"content-type": "text/html",
					"content-length": "1000001",
				},
			}),
		);

		const metadata = await extractMetadata("https://example.com/large");
		expect(metadata.title).toBe("example.com");
	});

	it("returns fallback metadata when fetch fails", async () => {
		vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("boom"));

		const metadata = await extractMetadata("https://example.com/error");
		expect(metadata.title).toBe("example.com");
		expect(metadata.description).toBeNull();
	});
});
