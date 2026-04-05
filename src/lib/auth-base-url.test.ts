import { describe, expect, it } from "vitest";
import { getAuthBaseUrlConfig } from "#/lib/auth-base-url";

describe("getAuthBaseUrlConfig", () => {
	it("allows the production domains and common local dev hosts", () => {
		expect(getAuthBaseUrlConfig("https://hold-shelf.com")).toEqual({
			allowedHosts: [
				"hold-shelf.com",
				"www.hold-shelf.com",
				"localhost",
				"localhost:*",
				"127.0.0.1",
				"127.0.0.1:*",
				"[::1]",
				"[::1]:*",
			],
			fallback: "https://hold-shelf.com",
		});
	});
});
