import { isIP } from "node:net";
import { securityConfig } from "#/server/config";

function normalizeIpCandidate(raw: string | null | undefined): string | null {
	if (!raw) return null;
	const trimmed = raw.trim();
	if (!trimmed) return null;
	const withoutBrackets =
		trimmed.startsWith("[") && trimmed.endsWith("]")
			? trimmed.slice(1, -1)
			: trimmed;
	const ipVersion = isIP(withoutBrackets);
	if (!ipVersion) return null;
	return withoutBrackets.toLowerCase();
}

export function getClientAddressFromHeaders(
	headers: Headers,
	trustProxyHeaders = securityConfig.trustProxyHeaders,
): string | null {
	if (!trustProxyHeaders) {
		return null;
	}

	// Only trust the single-valued identity supplied by Cloudflare ingress.
	// X-Forwarded-For can preserve an attacker-supplied prefix; X-Real-IP and
	// User-Agent are not alternative identities when that header is missing.
	return normalizeIpCandidate(headers.get("cf-connecting-ip"));
}

export function getClientRateLimitKey(
	request: Request,
	trustProxyHeaders = securityConfig.trustProxyHeaders,
): string {
	const ip = getClientAddressFromHeaders(request.headers, trustProxyHeaders);
	if (ip) {
		return `ip:${ip}`;
	}

	return "ip:unknown";
}
