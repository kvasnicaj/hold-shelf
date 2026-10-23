import { env } from "cloudflare:workers";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { getDb } from "#/db/index";
import { getAuthSecurityOptions } from "#/lib/auth-security";

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
		...getAuthSecurityOptions(
			env.BETTER_AUTH_URL as string,
			import.meta.env.DEV,
		),
		database: drizzleAdapter(getDb(), { provider: "sqlite" }),
		user: {
			deleteUser: {
				enabled: true,
			},
		},
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
