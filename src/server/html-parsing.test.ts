import { describe, expect, it } from "vitest";
import {
	decodeHtmlEntities,
	extractFavicon,
	extractMeta,
	extractTag,
} from "#/server/html-parsing";

describe("html parsing helpers", () => {
	it("extracts tag content and meta content", () => {
		const html = `
			<html>
				<head>
					<title> Hold Shelf </title>
					<meta name="description" content="Quiet reading list" />
					<meta content="Hold Shelf OG" property="og:title" />
				</head>
			</html>
		`;

		expect(extractTag(html, /<title[^>]*>([^<]*)<\/title>/i)).toBe(
			"Hold Shelf",
		);
		expect(extractMeta(html, "description")).toBe("Quiet reading list");
		expect(extractMeta(html, "og:title")).toBe("Hold Shelf OG");
	});

	it("extracts favicon URLs from relative, absolute, and protocol-relative hrefs", () => {
		expect(
			extractFavicon(
				'<link rel="icon" href="/favicon.ico" />',
				"https://example.com",
			),
		).toBe("https://example.com/favicon.ico");
		expect(
			extractFavicon(
				'<link rel="shortcut icon" href="https://cdn.example.com/icon.png" />',
				"https://example.com",
			),
		).toBe("https://cdn.example.com/icon.png");
		expect(
			extractFavicon(
				'<link href="//cdn.example.com/icon.png" rel="icon" />',
				"https://example.com",
			),
		).toBe("https://cdn.example.com/icon.png");
	});

	it("decodes common HTML entities and numeric references", () => {
		expect(
			decodeHtmlEntities("Tom &amp; Jerry &#39;special&#39; &#x1F4DA;"),
		).toBe("Tom & Jerry 'special' \u{1F4DA}");
	});
});
