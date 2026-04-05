// Worker secrets not in wrangler.jsonc vars — declared here for type safety.
// These are set via `wrangler secret put <NAME>`.
declare namespace Cloudflare {
	interface Env {
		BETTER_AUTH_SECRET: string;
		SENTRY_DSN?: string;
		GITHUB_CLIENT_ID: string;
		GITHUB_CLIENT_SECRET: string;
	}
}
