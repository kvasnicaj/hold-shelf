import { describe, expect, it } from "vitest";
import { getHomeSummary } from "#/components/home/helpers";

describe("getHomeSummary", () => {
	it("speaks to the reader's unread count", () => {
		expect(getHomeSummary({ unread: 0, total: 0 })).toBe(
			"Your shelf is empty for now.",
		);
		expect(getHomeSummary({ unread: 0, total: 7 })).toBe(
			"You're all caught up. The shelf is here when you want it.",
		);
		expect(getHomeSummary({ unread: 1, total: 7 })).toBe(
			"One article is waiting for you.",
		);
		expect(getHomeSummary({ unread: 4, total: 7 })).toBe(
			"4 articles are waiting for you.",
		);
	});
});
