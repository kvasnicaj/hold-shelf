import { describe, expect, it } from "vitest";
import { getAuthBaseUrlConfig } from "#/lib/auth-base-url";

describe("getAuthBaseUrlConfig", () => {
	it("only allows production domains with an explicit HTTPS protocol", () => {
		expect(getAuthBaseUrlConfig("https://hold-shelf.com")).toEqual({
			allowedHosts: ["hold-shelf.com", "www.hold-shelf.com"],
			fallback: "https://hold-shelf.com",
			protocol: "https",
		});
	});

	it.each([
		"http://hold-shelf.com",
		"http://localhost:3000",
		"https://attacker.example",
		"https://hold-shelf.com:444",
		"https://user:password@hold-shelf.com",
		"https://hold-shelf.com/api/auth",
		"https://hold-shelf.com?redirect=attacker",
	])("rejects an unsafe production fallback %s", (url) => {
		expect(() => getAuthBaseUrlConfig(url)).toThrow();
	});

	it.each(["localhost:3000", "127.0.0.1:3000", "[::1]:3000"])(
		"keeps HTTP local development separate at %s",
		(host) => {
			const config = getAuthBaseUrlConfig(`http://${host}`, true);
			expect(config.protocol).toBe("http");
			expect(config.fallback).toBe(`http://${host}`);
			expect(config.allowedHosts).not.toContain("hold-shelf.com");
		},
	);

	it("does not allow the production origin in development", () => {
		expect(() =>
			getAuthBaseUrlConfig("https://hold-shelf.com", true),
		).toThrow();
	});
});
