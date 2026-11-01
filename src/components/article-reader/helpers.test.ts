import { describe, expect, it } from "vitest";
import {
	DEFAULT_READER_SETTINGS,
	parseReaderSettings,
	splitRepeatedTitle,
} from "#/components/article-reader/helpers";

describe("parseReaderSettings", () => {
	it("keeps the text size saved by the previous reader and fills in the rest", () => {
		expect(parseReaderSettings(JSON.stringify({ fontSize: 21 }))).toEqual({
			fontSize: 21,
			width: "normal",
			font: "serif",
		});
	});

	it("clamps sizes and ignores unknown values", () => {
		expect(
			parseReaderSettings(
				JSON.stringify({ fontSize: 40, width: "huge", font: "mono" }),
			),
		).toEqual({ fontSize: 24, width: "normal", font: "serif" });
		expect(
			parseReaderSettings(
				JSON.stringify({ fontSize: 15, width: "wide", font: "sans" }),
			),
		).toEqual({ fontSize: 15, width: "wide", font: "sans" });
	});

	it("falls back to defaults for missing or broken storage", () => {
		expect(parseReaderSettings(null)).toEqual(DEFAULT_READER_SETTINGS);
		expect(parseReaderSettings("{not json")).toEqual(DEFAULT_READER_SETTINGS);
	});
});

describe("splitRepeatedTitle", () => {
	const body =
		"React components usually run in one place.\n\n## Server and client\n\nMore text.";

	it("drops a first heading that repeats the title without the publisher suffix", () => {
		expect(
			splitRepeatedTitle(
				`# Impossible Components\n\n${body}`,
				"Impossible Components — overreacted",
			),
		).toEqual({ title: "Impossible Components", markdown: body });
	});

	it("matches a publisher prefix and equivalent quotes, dashes and escapes", () => {
		expect(
			splitRepeatedTitle(
				`## Don’t Ship Node.js 18 – Upgrade Notes\n\n${body}`,
				"Node.js Blog | Don't ship Node.js 18 - upgrade notes",
			),
		).toEqual({
			title: "Don’t Ship Node.js 18 – Upgrade Notes",
			markdown: body,
		});
	});

	it("keeps the saved title when the heading carries the publisher", () => {
		expect(
			splitRepeatedTitle(
				`# The Web’s Grain · Frank Chimero\n\n${body}`,
				"The Web's Grain",
			),
		).toEqual({ title: "The Web's Grain", markdown: body });
	});

	it("drops an exact repeat whatever its case and trailing punctuation", () => {
		expect(splitRepeatedTitle(`# Why Rust?\n\n${body}`, "why rust")).toEqual({
			title: "why rust",
			markdown: body,
		});
	});

	it("keeps a first section heading that only shares words with the title", () => {
		const markdown = `# Components\n\n${body}`;
		expect(
			splitRepeatedTitle(markdown, "Components of a Design System"),
		).toEqual({ title: "Components of a Design System", markdown });
	});

	it("does not treat a colon subtitle or a long tail as a publisher", () => {
		const topic = `# Rust\n\n${body}`;
		expect(
			splitRepeatedTitle(topic, "Rust: A Language for the Next 40 Years"),
		).toEqual({
			title: "Rust: A Language for the Next 40 Years",
			markdown: topic,
		});

		const lead = `# Impossible Components\n\n${body}`;
		const long =
			"Impossible Components - why server and client code can compose in one tree";
		expect(splitRepeatedTitle(lead, long)).toEqual({
			title: long,
			markdown: lead,
		});
	});

	it("only looks at a heading that opens the article", () => {
		const markdown = `Intro paragraph.\n\n# Impossible Components\n\n${body}`;
		expect(
			splitRepeatedTitle(markdown, "Impossible Components — overreacted"),
		).toEqual({ title: "Impossible Components — overreacted", markdown });
	});
});
