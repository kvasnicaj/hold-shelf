import { withSentry } from "@sentry/cloudflare";
import handler from "@tanstack/react-start/server-entry";
import { isProductionSentryUrl } from "#/lib/sentry-environment";
import { withBackgroundContext } from "#/server/background";

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

const workerHandler = {
	scheduled(
		_controller: ScheduledController,
		_env: Cloudflare.Env,
		ctx: ExecutionContext,
	) {
		ctx.waitUntil(
			import("#/server/rate-limit").then(({ cleanupRateLimits }) =>
				cleanupRateLimits(),
			),
		);
	},
	fetch(request: Request, _env: Cloudflare.Env, ctx: ExecutionContext) {
		return withBackgroundContext(ctx, () => handler.fetch(request));
	},
};

const exportedHandler = import.meta.env.DEV
	? workerHandler
	: withSentry(
			getSentryOptions,
			// biome-ignore lint/suspicious/noExplicitAny: handler type mismatch between TanStack Start and Sentry's ExportedHandler
			workerHandler as any,
		);

export default exportedHandler;
