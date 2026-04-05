import { withSentry } from "@sentry/cloudflare";
import handler from "@tanstack/react-start/server-entry";
import { isProductionSentryUrl } from "#/lib/sentry-environment";

function getSentryOptions(env: Record<string, unknown>) {
	const dsn = typeof env.SENTRY_DSN === "string" ? env.SENTRY_DSN : undefined;
	const authUrl =
		typeof env.BETTER_AUTH_URL === "string" ? env.BETTER_AUTH_URL : undefined;
	const isProduction = isProductionSentryUrl(authUrl);

	return {
		dsn,
		enabled: Boolean(dsn) && isProduction,
		environment: isProduction ? "production" : "development",
		tracesSampleRate: isProduction ? 0.1 : 0,
	};
}

const exportedHandler = import.meta.env.DEV
	? handler
	: withSentry(
			getSentryOptions,
			// biome-ignore lint/suspicious/noExplicitAny: handler type mismatch between TanStack Start and Sentry's ExportedHandler
			handler as any,
		);

export default exportedHandler;
