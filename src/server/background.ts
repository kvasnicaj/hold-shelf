import { AsyncLocalStorage } from "node:async_hooks";
import { safeErrorDetails } from "#/lib/sentry-privacy";

type BackgroundContext = { waitUntil: (promise: Promise<unknown>) => void };
const context = new AsyncLocalStorage<BackgroundContext>();
export function withBackgroundContext<T>(
	ctx: BackgroundContext,
	run: () => T,
): T {
	return context.run(ctx, run);
}
export function scheduleBackground(run: () => Promise<unknown>): boolean {
	const ctx = context.getStore();
	if (!ctx) return false;
	ctx.waitUntil(
		run().catch((error) =>
			console.error("Background article capture failed", {
				code: "BACKGROUND_CAPTURE_FAILED",
				...safeErrorDetails(error),
			}),
		),
	);
	return true;
}
