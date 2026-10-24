import * as Sentry from "@sentry/react";
import { isProductionSentryHostname } from "#/lib/sentry-environment";
import {
	getSentryPrivacyOptions,
	sentryPrivacyIntegration,
} from "#/lib/sentry-privacy";

const SENTRY_DSN =
	"https://2ba2dbe489a3461dbd4e6e5457c81fad@o4511162569654272.ingest.de.sentry.io/4511162577256528";

export function initSentry(hasConsent: () => boolean) {
	if (typeof window === "undefined") return;
	if (!isProductionSentryHostname(window.location.hostname)) return;
	if (!hasConsent()) return;

	Sentry.init({
		...getSentryPrivacyOptions(),
		dsn: SENTRY_DSN,
		environment: "production",
		enabled: true,
		// Check consent at export time too, including SDK background span batches.
		transport: (options) => {
			const transport = Sentry.makeFetchTransport(options);
			return {
				...transport,
				send: (envelope) =>
					hasConsent() ? transport.send(envelope) : Promise.resolve({}),
			};
		},
		sendClientReports: false,
		integrations: [
			Sentry.browserTracingIntegration(),
			sentryPrivacyIntegration(),
		],
		tracesSampleRate: 0.1,
	});
}
