const PRODUCTION_SENTRY_HOSTS = new Set([
	"hold-shelf.com",
	"www.hold-shelf.com",
]);

export function isProductionSentryHostname(
	hostname: string | null | undefined,
) {
	return typeof hostname === "string" && PRODUCTION_SENTRY_HOSTS.has(hostname);
}

export function isProductionSentryUrl(url: string | null | undefined) {
	if (typeof url !== "string" || url.length === 0) {
		return false;
	}

	try {
		return isProductionSentryHostname(new URL(url).hostname);
	} catch {
		return false;
	}
}
