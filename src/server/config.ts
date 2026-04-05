function parseBooleanEnv(
	value: string | undefined,
	defaultValue: boolean,
): boolean {
	if (value === undefined) return defaultValue;
	const normalized = value.trim().toLowerCase();
	if (["1", "true", "yes", "on"].includes(normalized)) return true;
	if (["0", "false", "no", "off"].includes(normalized)) return false;
	return defaultValue;
}

function parseNumberEnv(
	value: string | undefined,
	defaultValue: number,
	{
		min,
		max,
	}: {
		min: number;
		max: number;
	},
): number {
	if (!value) return defaultValue;
	const parsed = Number(value);
	if (!Number.isFinite(parsed)) return defaultValue;
	return Math.min(max, Math.max(min, Math.floor(parsed)));
}

export const securityConfig = {
	trustProxyHeaders: parseBooleanEnv(process.env.TRUST_PROXY_HEADERS, false),
} as const;

export const metadataConfig = {
	maxRedirects: parseNumberEnv(process.env.METADATA_MAX_REDIRECTS, 3, {
		min: 0,
		max: 10,
	}),
	maxBytes: parseNumberEnv(process.env.METADATA_MAX_BYTES, 1_000_000, {
		min: 1_024,
		max: 10_000_000,
	}),
	timeoutMs: parseNumberEnv(process.env.METADATA_TIMEOUT_MS, 8_000, {
		min: 1_000,
		max: 30_000,
	}),
} as const;
