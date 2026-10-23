import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { createCookieGetter, getCookies } from "better-auth/cookies";
import { describe, expect, it, vi } from "vitest";
import {
	expireLegacyAuthCookies,
	getAuthSecurityOptions,
} from "#/lib/auth-security";

const TEST_SECRET = "synthetic-test-secret-at-least-32-characters-long";

describe("production authentication security", () => {
	it("sets Secure session and OAuth cookies without relying on NODE_ENV", () => {
		vi.stubEnv("NODE_ENV", "development");
		const options = getAuthSecurityOptions("https://hold-shelf.com");
		const cookies = getCookies(options);
		for (const cookie of [
			cookies.sessionToken,
			createCookieGetter(options)("state"),
			createCookieGetter(options)("oauth_state"),
		]) {
			expect(cookie.name).toMatch(/^__Secure-better-auth\./);
			expect(cookie.attributes).toMatchObject({
				secure: true,
				httpOnly: true,
				sameSite: "lax",
				path: "/",
			});
			expect(cookie.attributes).not.toHaveProperty("domain");
		}
	});

	it("allows non-Secure cookies only for explicitly local development", () => {
		const options = getAuthSecurityOptions("http://localhost:3000", true);
		expect(getCookies(options).sessionToken).toMatchObject({
			name: "better-auth.session_token",
			attributes: { secure: false, httpOnly: true, sameSite: "lax" },
		});
	});

	it("expires legacy names without migrating a potentially exposed session", () => {
		const request = new Request("https://hold-shelf.com/api/auth/get-session", {
			headers: {
				cookie:
					"better-auth.session_token=old; better-auth.state=old; better-auth.session_data.0=old; unrelated=keep; __Secure-better-auth.session_token=new",
			},
		});
		const response = new Response("ok", {
			headers: {
				"set-cookie": "__Secure-better-auth.session_token=new; Secure",
			},
		});
		const updated = expireLegacyAuthCookies(request, response);
		expect(updated.headers.getSetCookie()).toEqual([
			"__Secure-better-auth.session_token=new; Secure",
			"better-auth.session_token=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=Lax",
			"better-auth.state=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=Lax",
			"better-auth.session_data.0=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=Lax",
		]);
		expect(expireLegacyAuthCookies(request, response, true)).toBe(response);
	});

	it.each(["http://localhost:3000", "https://attacker.example"])(
		"rejects cookie-bearing production OAuth requests from origin %s",
		async (origin) => {
			const auth = betterAuth({
				...getAuthSecurityOptions("https://hold-shelf.com"),
				secret: TEST_SECRET,
				logger: { disabled: true },
				database: memoryAdapter({
					user: [],
					account: [],
					session: [],
					verification: [],
				}),
				socialProviders: {
					github: { clientId: "synthetic", clientSecret: "synthetic" },
				},
			});
			const response = await auth.handler(
				new Request("https://hold-shelf.com/api/auth/sign-in/social", {
					method: "POST",
					headers: {
						"content-type": "application/json",
						origin,
						cookie: "existing-browser-cookie=synthetic",
						"x-forwarded-host": new URL(origin).host,
						"x-forwarded-proto": "http",
					},
					body: JSON.stringify({ provider: "github" }),
				}),
			);
			expect(response.status).toBe(403);
			expect(response.headers.getSetCookie()).toHaveLength(0);
		},
	);

	it("completes first and returning OAuth logins without retaining provider tokens", async () => {
		const storage: Record<string, Record<string, unknown>[]> = {
			user: [],
			account: [],
			session: [],
			verification: [],
		};
		const auth = betterAuth({
			...getAuthSecurityOptions("https://hold-shelf.com"),
			secret: TEST_SECRET,
			database: memoryAdapter(storage),
			socialProviders: {
				github: { clientId: "synthetic", clientSecret: "synthetic" },
			},
		});
		const context = await auth.$context;
		const provider = context.socialProviders.find(
			(item) => item.id === "github",
		);
		if (!provider) throw new Error("Missing synthetic GitHub provider");
		// Exercise Better Auth's real callback, account hooks, adapter and session
		// cookies. Only the remote exchange/profile lookup is synthetic.
		provider.validateAuthorizationCode = async () => ({
			accessToken: "synthetic-github-access-token",
			refreshToken: "synthetic-github-refresh-token",
			idToken: "synthetic-id-token",
			accessTokenExpiresAt: new Date(Date.now() + 60_000),
			refreshTokenExpiresAt: new Date(Date.now() + 120_000),
		});
		provider.getUserInfo = async () => ({
			user: {
				name: "Synthetic User",
				email: "synthetic@example.test",
				emailVerified: true,
			},
			data: { id: 424242 },
		});

		for (let login = 0; login < 2; login++) {
			const signIn = await auth.handler(
				new Request("https://hold-shelf.com/api/auth/sign-in/social", {
					method: "POST",
					headers: {
						"content-type": "application/json",
						origin: "https://hold-shelf.com",
					},
					body: JSON.stringify({
						provider: "github",
						callbackURL: "https://hold-shelf.com/app/home",
					}),
				}),
			);
			expect(signIn.status).toBe(200);
			const authorization = (await signIn.json()) as { url: string };
			const state = new URL(authorization.url).searchParams.get("state");
			const callback = await auth.handler(
				new Request(
					`https://hold-shelf.com/api/auth/callback/github?code=synthetic&state=${state}`,
					{
						headers: {
							"cf-connecting-ip": "203.0.113.42",
							"x-forwarded-for": "198.51.100.66, 203.0.113.42",
							"x-real-ip": "198.51.100.66",
							cookie: signIn.headers
								.getSetCookie()
								.map((cookie) => cookie.split(";", 1)[0])
								.join("; "),
						},
					},
				),
			);
			expect(callback.status).toBe(302);
			expect(callback.headers.get("location")).toBe(
				"https://hold-shelf.com/app/home",
			);
			expect(storage.account).toHaveLength(1);
			expect(storage.account[0]).toMatchObject({
				providerId: "github",
				accountId: "424242",
				accessToken: null,
				refreshToken: null,
				idToken: null,
				accessTokenExpiresAt: null,
				refreshTokenExpiresAt: null,
			});
			const sessionCookie = callback.headers
				.getSetCookie()
				.find((cookie) =>
					cookie.startsWith("__Secure-better-auth.session_token="),
				);
			expect(sessionCookie).toMatch(/; Secure/i);
			expect(sessionCookie).toMatch(/; HttpOnly/i);
			expect(sessionCookie).toMatch(/; SameSite=Lax/i);
			const session = await auth.api.getSession({
				headers: new Headers({ cookie: sessionCookie?.split(";", 1)[0] ?? "" }),
			});
			expect(session?.user.email).toBe("synthetic@example.test");
			expect(session?.session.ipAddress).toBe("203.0.113.42");
			// Old, unprefixed browser cookies are not an authentication fallback.
			const legacySession = await auth.api.getSession({
				headers: new Headers({
					cookie:
						sessionCookie?.split(";", 1)[0].replace("__Secure-", "") ?? "",
				}),
			});
			expect(legacySession).toBeNull();
		}
		expect(JSON.stringify(storage.account)).not.toContain(
			"synthetic-github-access-token",
		);
	});
});
