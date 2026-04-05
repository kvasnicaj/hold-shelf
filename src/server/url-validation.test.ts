import { describe, expect, it } from "vitest";
import { validateExternalUrl } from "#/server/url-validation";

describe("validateExternalUrl", () => {
	it("blocks localhost", () => {
		expect(() => validateExternalUrl("http://localhost:3000/private")).toThrow(
			"This URL is not allowed.",
		);
	});

	it("blocks IPv4-mapped IPv6 loopback", () => {
		expect(() => validateExternalUrl("http://[::ffff:127.0.0.1]/")).toThrow(
			"This URL is not allowed.",
		);
	});

	it("blocks decimal-encoded hostnames", () => {
		expect(() => validateExternalUrl("http://2130706433/")).toThrow(
			"This URL is not allowed.",
		);
	});

	it("allows public targets", () => {
		const result = validateExternalUrl("https://example.com/path");
		expect(result.toString()).toBe("https://example.com/path");
	});
});
