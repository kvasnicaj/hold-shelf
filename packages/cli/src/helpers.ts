import {
	createArticleRequestSchema,
	identifierSchema,
} from "@hold-shelf/api-contracts";
import { UsageError } from "./errors.js";
import type { CliInput } from "./types.js";

export const API_TOKEN_PATTERN = /^hs_[A-Za-z0-9_-]{43}$/;

export function validateToken(value: string): string {
	const token = value.trim();
	if (!API_TOKEN_PATTERN.test(token)) {
		throw new UsageError(
			"Invalid API token. Expected an hs_ token from Hold Shelf Settings.",
		);
	}
	return token;
}

export function maskToken(token: string): string {
	return `${token.slice(0, 10)}…${token.slice(-4)}`;
}

export function redactSecrets(value: unknown): string {
	return String(value)
		.replace(
			/Authorization\s*:\s*Bearer\s+\S+/gi,
			"Authorization: Bearer [REDACTED]",
		)
		.replace(/Bearer\s+hs_[A-Za-z0-9_-]+/gi, "Bearer [REDACTED]")
		.replace(/hs_[A-Za-z0-9_-]{8,}/g, "[REDACTED]");
}

export function positiveInteger(
	value: string,
	label: string,
	maximum?: number,
): number {
	if (!/^\d+$/.test(value)) {
		throw new UsageError(`${label} must be a positive integer.`);
	}
	const parsed = Number(value);
	if (!Number.isSafeInteger(parsed) || parsed < 1) {
		throw new UsageError(`${label} must be a positive integer.`);
	}
	if (maximum !== undefined && parsed > maximum) {
		throw new UsageError(`${label} cannot be greater than ${maximum}.`);
	}
	return parsed;
}

export function validateIdentifier(
	value: string,
	label = "Article id",
): string {
	const result = identifierSchema.safeParse(value);
	if (!result.success) {
		throw new UsageError(`${label} must contain between 1 and 128 characters.`);
	}
	return result.data;
}

export function validateArticleUrl(value: string): string {
	const result = createArticleRequestSchema.safeParse({ url: value });
	if (!result.success) {
		throw new UsageError("Article URL must be a valid http or https URL.");
	}
	return result.data.url;
}

export async function readAllInput(input: CliInput): Promise<string> {
	let result = "";
	for await (const chunk of input) {
		result +=
			typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("utf8");
		if (result.length > 8_192) {
			throw new UsageError("Token input is too large.");
		}
	}
	return result.trim();
}
