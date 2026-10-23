const API_BODY_LIMIT = 64 * 1024;
const SERVER_BODY_LIMIT = 10 * 1024 * 1024;

const BASELINE_CSP =
	"frame-ancestors 'none'; base-uri 'self'; object-src 'none'";
const REPORT_ONLY_CSP = [
	"default-src 'self'",
	"script-src 'self'",
	"style-src 'self' 'unsafe-inline'",
	"img-src 'self' https: data:",
	"connect-src 'self' https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://*.ingest.de.sentry.io",
	"font-src 'self'",
	BASELINE_CSP,
].join("; ");

/** Read before framework/JSON parsing, including streams without Content-Length. */
export async function boundRequestBody(
	request: Request,
): Promise<Request | Response> {
	if (!request.body) return request;
	const limit = new URL(request.url).pathname.startsWith("/api/")
		? API_BODY_LIMIT
		: SERVER_BODY_LIMIT;
	const length = request.headers.get("content-length");
	if (length && /^\d+$/.test(length) && Number(length) > limit) {
		void request.body.cancel().catch(() => {});
		return bodyError(413);
	}
	const reader = request.body.getReader();
	const chunks: Uint8Array[] = [];
	let total = 0;
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			total += value.byteLength;
			if (total > limit) {
				void reader.cancel().catch(() => {});
				return bodyError(413);
			}
			chunks.push(value);
		}
	} catch {
		return bodyError(400);
	} finally {
		reader.releaseLock();
	}
	const body = new Uint8Array(total);
	let offset = 0;
	for (const chunk of chunks) {
		body.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return new Request(request, { body });
}

export function withSecurityHeaders(
	response: Response,
	request: Request,
): Response {
	const headers = new Headers(response.headers);
	headers.set("X-Content-Type-Options", "nosniff");
	headers.set("X-Frame-Options", "DENY");
	headers.set("Referrer-Policy", "no-referrer");
	headers.set(
		"Permissions-Policy",
		"camera=(), microphone=(), geolocation=(), payment=(), usb=()",
	);
	// Append rather than replace an existing, stricter route policy.
	headers.append("Content-Security-Policy", BASELINE_CSP);
	headers.set("Content-Security-Policy-Report-Only", REPORT_ONLY_CSP);
	// Hashed build assets are the only responses exempt from the dynamic policy.
	const path = new URL(request.url).pathname;
	if (
		!path.startsWith("/assets/") ||
		request.headers.has("authorization") ||
		request.headers.has("cookie") ||
		headers.has("set-cookie")
	) {
		headers.set("Cache-Control", "private, no-store");
		headers.delete("CDN-Cache-Control");
		headers.delete("Cloudflare-CDN-Cache-Control");
	}
	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
}

function bodyError(status: 400 | 413): Response {
	return Response.json(
		{
			code: status === 413 ? "PAYLOAD_TOO_LARGE" : "INVALID_BODY",
			message:
				status === 413
					? "Request body exceeds the allowed size."
					: "Request body could not be read.",
		},
		{ status },
	);
}
