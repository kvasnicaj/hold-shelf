import { describe, expect, it } from "vitest";
import {
	getClientAddressFromHeaders,
	getClientRateLimitKey,
} from "#/server/client-key";

describe("client rate-limit key", () => {
	it("uses only the Cloudflare IP when trusted", () => {
		const headers = new Headers({
			"cf-connecting-ip": "203.0.113.42",
			"x-forwarded-for": "192.0.2.66, 70.1.2.3",
		});

		expect(getClientAddressFromHeaders(headers, false)).toBeNull();
		expect(getClientAddressFromHeaders(headers, true)).toBe("203.0.113.42");
	});

	it("does not let user-agent split the fallback security bucket", () => {
		const request = new Request("https://hold-shelf.com/api/auth", {
			headers: {
				"user-agent": "Mozilla Test Agent",
			},
		});

		expect(getClientRateLimitKey(request, false)).toBe("ip:unknown");
	});

	it("builds IP-based key when a trusted IP exists", () => {
		const request = new Request("https://hold-shelf.com/api/auth", {
			headers: {
				"cf-connecting-ip": "198.51.100.9",
				"user-agent": "Mozilla Test Agent",
			},
		});

		expect(getClientRateLimitKey(request, true)).toBe("ip:198.51.100.9");
	});

	it("keeps the same bucket when spoofed headers change", () => {
		const keys = ["192.0.2.1", "192.0.2.2"].map((spoofed) =>
			getClientRateLimitKey(
				new Request("https://hold-shelf.com/api/auth", {
					headers: {
						"cf-connecting-ip": "203.0.113.42",
						"x-forwarded-for": `${spoofed}, 203.0.113.42`,
						"x-real-ip": spoofed,
						"user-agent": spoofed,
					},
				}),
				true,
			),
		);
		expect(keys).toEqual(["ip:203.0.113.42", "ip:203.0.113.42"]);
	});

	it.each([undefined, "not-an-ip", "203.0.113.1, 192.0.2.1", "203.0.113.1:80"])(
		"does not fall through to spoofable headers for invalid Cloudflare IP %s",
		(ip) => {
			const headers = new Headers({
				"x-forwarded-for": "192.0.2.66",
				"x-real-ip": "192.0.2.67",
			});
			if (ip) headers.set("cf-connecting-ip", ip);
			expect(getClientAddressFromHeaders(headers, true)).toBeNull();
		},
	);

	it("normalizes a single valid IPv6 address", () => {
		expect(
			getClientAddressFromHeaders(
				new Headers({ "cf-connecting-ip": "2001:DB8::A" }),
				true,
			),
		).toBe("2001:db8::a");
	});
});
