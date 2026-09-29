import { expect, it } from "vitest";
import { safeReturnPath } from "#/components/auth/helpers";

it("accepts internal return links while rejecting external and browser-normalized redirects", () => {
	expect(safeReturnPath("/app/home?from=save#article=123")).toBe(
		"/app/home?from=save#article=123",
	);
	for (const url of [
		"//evil.example",
		"/\\evil.example",
		"https://evil.example",
		"/\n/evil.example",
		" //evil.example",
		null,
	])
		expect(safeReturnPath(url)).toBeUndefined();
});
