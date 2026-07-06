import { metadataConfig } from "#/server/config";
import { validateExternalUrl } from "#/server/url-validation";

const HTML_CONTENT_TYPES = ["text/html", "application/xhtml+xml"];

export function isHtmlContentType(contentType: string | null): boolean {
	if (!contentType) return false;
	const normalized = contentType.toLowerCase();
	return HTML_CONTENT_TYPES.some((candidate) => normalized.includes(candidate));
}

function isRedirectStatus(status: number): boolean {
	return [301, 302, 303, 307, 308].includes(status);
}

export async function readTextWithinLimit(
	response: Response,
	maxBytes: number,
): Promise<string> {
	const contentLength = response.headers.get("content-length");
	if (contentLength) {
		const parsed = Number(contentLength);
		if (Number.isFinite(parsed) && parsed > maxBytes) {
			throw new Error("Response too large");
		}
	}

	if (!response.body) {
		return "";
	}

	const reader = response.body.getReader();
	const decoder = new TextDecoder();
	let total = 0;
	let text = "";

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		total += value.byteLength;
		if (total > maxBytes) {
			throw new Error("Response too large");
		}
		text += decoder.decode(value, { stream: true });
	}

	text += decoder.decode();
	return text;
}

export async function fetchHtmlWithGuards(
	initialUrl: string,
): Promise<{ response: Response; finalUrl: URL }> {
	let currentUrl = initialUrl;

	for (let hop = 0; hop <= metadataConfig.maxRedirects; hop++) {
		const validated = await validateExternalUrl(currentUrl);
		const response = await fetch(validated.toString(), {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (compatible; Hold-Shelf/1.0; +https://hold-shelf.com)",
				Accept: "text/html,application/xhtml+xml",
			},
			signal: AbortSignal.timeout(metadataConfig.timeoutMs),
			redirect: "manual",
		});

		if (isRedirectStatus(response.status)) {
			if (hop >= metadataConfig.maxRedirects) {
				throw new Error("Too many redirects");
			}
			const location = response.headers.get("location");
			if (!location) {
				throw new Error("Redirect target missing");
			}
			currentUrl = new URL(location, validated).toString();
			continue;
		}

		return { response, finalUrl: validated };
	}

	throw new Error("Too many redirects");
}
