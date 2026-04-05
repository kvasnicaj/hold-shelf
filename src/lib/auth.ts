import { env } from "cloudflare:workers";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { getDb } from "#/db/index";
import { getAuthBaseUrlConfig } from "#/lib/auth-base-url";

export function getAuth() {
	const githubClientId = env.GITHUB_CLIENT_ID;
	const githubClientSecret = env.GITHUB_CLIENT_SECRET;

	if (!githubClientId || !githubClientSecret) {
		throw new Error(
			"GitHub OAuth requires both GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.",
		);
	}

	return betterAuth({
		secret: env.BETTER_AUTH_SECRET as string,
		baseURL: getAuthBaseUrlConfig(env.BETTER_AUTH_URL as string),
		database: drizzleAdapter(getDb(), { provider: "sqlite" }),
		emailAndPassword: {
			enabled: false,
		},
		socialProviders: {
			github: {
				clientId: githubClientId,
				clientSecret: githubClientSecret,
				scope: ["read:user", "user:email"],
			},
		},
		plugins: [tanstackStartCookies()],
	});
}
