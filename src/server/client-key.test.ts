import { describe, expect, it } from "vitest";
import {
	getClientAddressFromHeaders,
	getClientRateLimitKey,
} from "#/server/client-key";

describe("client rate-limit key", () => {
	it("uses forwarded IP only when trusted", () => {
		const headers = new Headers({
			"x-forwarded-for": "203.0.113.42, 70.1.2.3",
		});

		expect(getClientAddressFromHeaders(headers, false)).toBeNull();
		expect(getClientAddressFromHeaders(headers, true)).toBe("203.0.113.42");
	});

	it("falls back to user-agent key when no trusted IP is available", () => {
		const request = new Request("https://hold-shelf.com/api/auth", {
			headers: {
				"user-agent": "Mozilla Test Agent",
			},
		});

		expect(getClientRateLimitKey(request, false)).toBe("ua:Mozilla Test Agent");
	});

	it("builds IP-based key when a trusted IP exists", () => {
		const request = new Request("https://hold-shelf.com/api/auth", {
			headers: {
				"x-real-ip": "198.51.100.9",
				"user-agent": "Mozilla Test Agent",
			},
		});

		expect(getClientRateLimitKey(request, true)).toBe("ip:198.51.100.9");
	});
});
