import { describe, expect, it } from "vitest";
import { getDisplayHost, toHttpUrl } from "#/components/quick-save/helpers";

describe("toHttpUrl", () => {
	it("keeps full http and https links", () => {
		expect(toHttpUrl("https://overreacted.io/impossible-components/")).toBe(
			"https://overreacted.io/impossible-components/",
		);
		expect(toHttpUrl("  http://example.com/a  ")).toBe("http://example.com/a");
	});

	it("adds https to links typed without a scheme", () => {
		expect(toHttpUrl("sqlite.org/lang.html")).toBe(
			"https://sqlite.org/lang.html",
		);
	});

	it("rejects text that is not a web link", () => {
		expect(toHttpUrl("")).toBeNull();
		expect(toHttpUrl("read this later")).toBeNull();
		expect(toHttpUrl("notes")).toBeNull();
		expect(toHttpUrl("mailto:reader@example.com")).toBeNull();
		expect(toHttpUrl("ftp://example.com/file")).toBeNull();
	});
});

describe("getDisplayHost", () => {
	it("drops the www prefix", () => {
		expect(getDisplayHost("https://www.howtogeek.com/vs-code")).toBe(
			"howtogeek.com",
		);
	});
});
