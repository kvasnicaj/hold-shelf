import { describe, expect, it, vi } from "vitest";
import { getSessionFromHeaders } from "#/server/auth-runtime";

describe("auth-runtime", () => {
	it("forwards request headers to the session lookup", async () => {
		const headers = new Headers({ cookie: "session=abc" });
		const getSessionFn = vi.fn().mockResolvedValue({ user: { id: "user-1" } });

		const result = await getSessionFromHeaders({
			headers,
			getSessionFn,
		});

		expect(getSessionFn).toHaveBeenCalledWith({ headers });
		expect(result).toEqual({ user: { id: "user-1" } });
	});
});
