import { isIP } from "node:net";

const BLOCKED_HOSTNAME_PATTERNS = [/^localhost$/i, /\.local$/i, /\.internal$/i];

const ALLOWED_SCHEMES = new Set(["http:", "https:"]);

const BLOCKED_URL_ERROR = "This URL is not allowed.";

function stripIpv6Brackets(hostname: string): string {
	return hostname.startsWith("[") && hostname.endsWith("]")
		? hostname.slice(1, -1)
		: hostname;
}

function parseNumericIpv4FromSingleInteger(hostname: string): string | null {
	if (!/^\d+$/.test(hostname)) return null;
	const value = Number(hostname);
	if (!Number.isInteger(value) || value < 0 || value > 0xffffffff) {
		return null;
	}
	const a = (value >>> 24) & 255;
	const b = (value >>> 16) & 255;
	const c = (value >>> 8) & 255;
	const d = value & 255;
	return `${a}.${b}.${c}.${d}`;
}

function parseNumericIpv4FromDotted(hostname: string): string | null {
	const parts = hostname.split(".");
	if (parts.length !== 4) return null;

	const values = parts.map((part) => {
		if (/^0x[0-9a-f]+$/i.test(part)) return Number.parseInt(part, 16);
		if (/^0[0-7]+$/.test(part)) return Number.parseInt(part, 8);
		if (/^\d+$/.test(part)) return Number.parseInt(part, 10);
		return Number.NaN;
	});

	if (
		values.some((value) => !Number.isInteger(value) || value < 0 || value > 255)
	) {
		return null;
	}

	return values.join(".");
}

function parseIPv4MappedIPv6(ip: string): string | null {
	const lower = ip.toLowerCase();
	if (!lower.startsWith("::ffff:")) return null;
	const tail = lower.slice("::ffff:".length);

	if (isIP(tail) === 4) {
		return tail;
	}

	const parts = tail.split(":");
	if (parts.length !== 2) return null;
	const first = Number.parseInt(parts[0], 16);
	const second = Number.parseInt(parts[1], 16);
	if (!Number.isInteger(first) || !Number.isInteger(second)) return null;
	if (first < 0 || first > 0xffff || second < 0 || second > 0xffff) return null;

	return `${(first >> 8) & 255}.${first & 255}.${(second >> 8) & 255}.${second & 255}`;
}

function isPrivateIPv4(ipv4: string): boolean {
	const parts = ipv4.split(".").map(Number);
	if (parts.length !== 4 || parts.some((part) => Number.isNaN(part)))
		return true;

	const [a, b] = parts;

	if (a === 0) return true;
	if (a === 10) return true;
	if (a === 100 && b >= 64 && b <= 127) return true;
	if (a === 127) return true;
	if (a === 169 && b === 254) return true;
	if (a === 172 && b >= 16 && b <= 31) return true;
	if (a === 192 && b === 0) return true;
	if (a === 192 && b === 168) return true;
	if (a === 198 && (b === 18 || b === 19)) return true;
	if (a >= 224) return true;
	return false;
}

function isPrivateIPv6(ipv6: string): boolean {
	const lower = ipv6.toLowerCase();
	if (lower === "::" || lower === "::1") return true;
	if (lower.startsWith("fe8") || lower.startsWith("fe9")) return true;
	if (lower.startsWith("fea") || lower.startsWith("feb")) return true;
	if (lower.startsWith("fc") || lower.startsWith("fd")) return true;
	if (lower.startsWith("ff")) return true;
	if (lower.startsWith("2001:db8")) return true;
	return false;
}

function isPrivateIP(ip: string): boolean {
	const normalized = stripIpv6Brackets(ip).toLowerCase();
	const ipVersion = isIP(normalized);
	if (!ipVersion) return true;

	if (ipVersion === 4) {
		return isPrivateIPv4(normalized);
	}

	const mapped = parseIPv4MappedIPv6(normalized);
	if (mapped) {
		return isPrivateIPv4(mapped);
	}

	return isPrivateIPv6(normalized);
}

function isNumericEncodedHostname(hostname: string): boolean {
	if (parseNumericIpv4FromSingleInteger(hostname)) return true;
	if (parseNumericIpv4FromDotted(hostname)) return true;
	return false;
}

export function validateExternalUrl(url: string): URL {
	let parsed: URL;
	try {
		parsed = new URL(url);
	} catch {
		throw new Error(BLOCKED_URL_ERROR);
	}

	if (!ALLOWED_SCHEMES.has(parsed.protocol)) {
		throw new Error(BLOCKED_URL_ERROR);
	}

	const normalizedHostname = stripIpv6Brackets(parsed.hostname);

	for (const pattern of BLOCKED_HOSTNAME_PATTERNS) {
		if (pattern.test(normalizedHostname)) {
			throw new Error(BLOCKED_URL_ERROR);
		}
	}

	if (isNumericEncodedHostname(normalizedHostname)) {
		throw new Error(BLOCKED_URL_ERROR);
	}

	const ipVersion = isIP(normalizedHostname);
	if (ipVersion) {
		if (isPrivateIP(normalizedHostname)) {
			throw new Error(BLOCKED_URL_ERROR);
		}
	}

	return new URL(parsed.toString());
}
