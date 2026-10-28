import { describe, expect, it } from "vitest";
import {
	DEFAULT_READER_SETTINGS,
	parseReaderSettings,
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
