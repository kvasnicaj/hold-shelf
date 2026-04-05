const AUTH_ALLOWED_HOSTS = [
	"hold-shelf.com",
	"www.hold-shelf.com",
	"localhost",
	"localhost:*",
	"127.0.0.1",
	"127.0.0.1:*",
	"[::1]",
	"[::1]:*",
];

export function getAuthBaseUrlConfig(fallbackBaseUrl: string) {
	return {
		allowedHosts: AUTH_ALLOWED_HOSTS,
		fallback: fallbackBaseUrl,
	};
}
