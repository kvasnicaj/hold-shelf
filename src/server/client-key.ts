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

	const forwarded = headers
		.get("x-forwarded-for")
		?.split(",")
		.map((part) => part.trim())
		.find(Boolean);
	const realIp = headers.get("x-real-ip");

	return (
		normalizeIpCandidate(forwarded) ?? normalizeIpCandidate(realIp) ?? null
	);
}

export function getClientRateLimitKey(
	request: Request,
	trustProxyHeaders = securityConfig.trustProxyHeaders,
): string {
	const ip = getClientAddressFromHeaders(request.headers, trustProxyHeaders);
	if (ip) {
		return `ip:${ip}`;
	}

	const userAgent = request.headers.get("user-agent")?.trim() || "unknown";
	return `ua:${userAgent.slice(0, 160)}`;
}
