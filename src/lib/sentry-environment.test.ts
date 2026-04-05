import { describe, expect, it } from "vitest";
import {
	isProductionSentryHostname,
	isProductionSentryUrl,
} from "#/lib/sentry-environment";

describe("Sentry environment helpers", () => {
	it("allows only the production hostnames", () => {
		expect(isProductionSentryHostname("hold-shelf.com")).toBe(true);
		expect(isProductionSentryHostname("www.hold-shelf.com")).toBe(true);
		expect(isProductionSentryHostname("localhost")).toBe(false);
		expect(isProductionSentryHostname("127.0.0.1")).toBe(false);
		expect(isProductionSentryHostname("preview.hold-shelf.com")).toBe(false);
	});

	it("accepts only production URLs", () => {
		expect(isProductionSentryUrl("https://hold-shelf.com")).toBe(true);
		expect(isProductionSentryUrl("https://www.hold-shelf.com/login")).toBe(
			true,
		);
		expect(isProductionSentryUrl("http://localhost:3000")).toBe(false);
		expect(isProductionSentryUrl("https://preview.hold-shelf.com")).toBe(false);
		expect(isProductionSentryUrl("not-a-url")).toBe(false);
	});
});
