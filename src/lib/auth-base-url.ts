const PRODUCTION_AUTH_HOSTS = ["hold-shelf.com", "www.hold-shelf.com"];

const DEVELOPMENT_AUTH_HOSTS = [
	"localhost",
	"localhost:*",
	"127.0.0.1",
	"127.0.0.1:*",
	"[::1]",
	"[::1]:*",
];

export function getAuthBaseUrlConfig(
	fallbackBaseUrl: string,
	isDevelopment = false,
) {
	const fallback = new URL(fallbackBaseUrl);
	const allowedHosts = isDevelopment
		? DEVELOPMENT_AUTH_HOSTS
		: PRODUCTION_AUTH_HOSTS;
	const validHost = isDevelopment
		? ["localhost", "127.0.0.1", "[::1]"].includes(fallback.hostname)
		: PRODUCTION_AUTH_HOSTS.includes(fallback.host);
	const protocol: "http" | "https" = isDevelopment ? "http" : "https";
	if (
		!validHost ||
		fallback.protocol !== `${protocol}:` ||
		fallback.username ||
		fallback.password ||
		fallback.pathname !== "/" ||
		fallback.search ||
		fallback.hash
	) {
		throw new Error(
			isDevelopment
				? "Development BETTER_AUTH_URL must be an HTTP loopback origin."
				: "Production BETTER_AUTH_URL must be an HTTPS Hold Shelf origin.",
		);
	}

	return {
		allowedHosts,
		fallback: fallback.origin,
		protocol,
	};
}
