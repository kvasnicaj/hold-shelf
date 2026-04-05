import * as Sentry from "@sentry/react";
import { isProductionSentryHostname } from "#/lib/sentry-environment";

const SENTRY_DSN =
	"https://2ba2dbe489a3461dbd4e6e5457c81fad@o4511162569654272.ingest.de.sentry.io/4511162577256528";

export function initSentry() {
	if (typeof window === "undefined") return;
	if (!isProductionSentryHostname(window.location.hostname)) return;

	Sentry.init({
		dsn: SENTRY_DSN,
		environment: "production",
		enabled: true,
		integrations: [Sentry.browserTracingIntegration()],
		tracesSampleRate: 0.1,
	});
}
