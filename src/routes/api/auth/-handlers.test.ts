import { beforeEach, describe, expect, it, vi } from "vitest";

const { authHandlerMock, getClientRateLimitKeyMock, checkRateLimitMock } =
	vi.hoisted(() => ({
		authHandlerMock: vi.fn(),
		getClientRateLimitKeyMock: vi.fn(),
		checkRateLimitMock: vi.fn(),
	}));

vi.mock("#/lib/auth", () => ({
	getAuth: () => ({
		handler: authHandlerMock,
	}),
}));

vi.mock("#/server/client-key", () => ({
	getClientRateLimitKey: getClientRateLimitKeyMock,
}));

vi.mock("#/server/rate-limit", () => ({
	checkRateLimit: checkRateLimitMock,
}));

import { handleAuthGet, handleAuthPost } from "#/routes/api/auth/-handlers";

describe("auth handlers", () => {
	beforeEach(() => {
		authHandlerMock.mockReset();
		getClientRateLimitKeyMock.mockReset();
		checkRateLimitMock.mockReset();
	});

	it("passes GET requests straight through to Better Auth", async () => {
		const request = new Request("https://hold-shelf.com/api/auth/session");
		const response = new Response("ok");
		authHandlerMock.mockResolvedValue(response);

		const result = await handleAuthGet({ request });

		expect(result).toBe(response);
		expect(authHandlerMock).toHaveBeenCalledWith(request);
	});

	it("passes POST requests through when the client is not rate limited", async () => {
		const request = new Request("https://hold-shelf.com/api/auth/sign-in", {
			method: "POST",
		});
		const response = new Response("ok");
		authHandlerMock.mockResolvedValue(response);
		getClientRateLimitKeyMock.mockReturnValue("ip:1.2.3.4");
		checkRateLimitMock.mockResolvedValue({ allowed: true, retryAfterMs: 0 });

		const result = await handleAuthPost({ request });

		expect(checkRateLimitMock).toHaveBeenCalledWith(
			{ name: "auth", windowMs: 60_000, max: 10 },
			"ip:1.2.3.4",
		);
		expect(result).toBe(response);
		expect(authHandlerMock).toHaveBeenCalledWith(request);
	});

	it("returns 429 with Retry-After when the client is rate limited", async () => {
		const request = new Request("https://hold-shelf.com/api/auth/sign-in", {
			method: "POST",
		});
		getClientRateLimitKeyMock.mockReturnValue("ip:1.2.3.4");
		checkRateLimitMock.mockResolvedValue({
			allowed: false,
			retryAfterMs: 1_500,
		});

		const response = await handleAuthPost({ request });

		expect(response.status).toBe(429);
		expect(response.headers.get("Retry-After")).toBe("2");
		expect(authHandlerMock).not.toHaveBeenCalled();
	});

	it("converts Better Auth API errors into JSON responses", async () => {
		const request = new Request("https://hold-shelf.com/api/auth/sign-in", {
			method: "POST",
		});
		getClientRateLimitKeyMock.mockReturnValue("ip:1.2.3.4");
		checkRateLimitMock.mockResolvedValue({ allowed: true, retryAfterMs: 0 });
		authHandlerMock.mockRejectedValue({
			name: "APIError",
			statusCode: 401,
			headers: {
				"X-Auth-Error": "true",
			},
			body: {
				code: "INVALID_EMAIL_OR_PASSWORD",
				message: "Invalid email or password",
			},
		});

		const response = await handleAuthPost({ request });

		expect(response.status).toBe(401);
		expect(response.headers.get("X-Auth-Error")).toBe("true");
		await expect(response.json()).resolves.toEqual({
			code: "INVALID_EMAIL_OR_PASSWORD",
			message: "Invalid email or password",
		});
	});
});
