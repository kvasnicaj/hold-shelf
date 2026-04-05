import { metadataConfig } from "#/server/config";
import {
	decodeHtmlEntities,
	extractFavicon,
	extractMeta,
	extractTag,
} from "#/server/html-parsing";
import { validateExternalUrl } from "#/server/url-validation";

export type ArticleMetadata = {
	title: string | null;
	description: string | null;
	faviconUrl: string | null;
	hostname: string;
};

const HTML_CONTENT_TYPES = ["text/html", "application/xhtml+xml"];

function isHtmlContentType(contentType: string | null): boolean {
	if (!contentType) return false;
	const normalized = contentType.toLowerCase();
	return HTML_CONTENT_TYPES.some((candidate) => normalized.includes(candidate));
}

function isRedirectStatus(status: number): boolean {
	return [301, 302, 303, 307, 308].includes(status);
}

async function readTextWithinLimit(
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

async function fetchHtmlWithGuards(
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

function createFallbackMetadata(hostname: string): ArticleMetadata {
	const fallbackFavicon = `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
	return {
		title: hostname,
		description: null,
		faviconUrl: fallbackFavicon,
		hostname,
	};
}

export async function extractMetadata(url: string): Promise<ArticleMetadata> {
	const parsed = await validateExternalUrl(url);
	const hostname = parsed.hostname;
	const fallback = createFallbackMetadata(hostname);

	try {
		const { response, finalUrl } = await fetchHtmlWithGuards(parsed.toString());

		if (!response.ok) {
			return fallback;
		}

		if (!isHtmlContentType(response.headers.get("content-type"))) {
			return fallback;
		}

		const html = await readTextWithinLimit(response, metadataConfig.maxBytes);

		const rawTitle =
			extractTag(html, /<title[^>]*>([^<]*)<\/title>/i) ??
			extractMeta(html, "og:title");
		const title = rawTitle ? decodeHtmlEntities(rawTitle) : hostname;

		const rawDescription =
			extractMeta(html, "og:description") ?? extractMeta(html, "description");
		const description = rawDescription
			? decodeHtmlEntities(rawDescription)
			: null;

		const faviconUrl =
			extractFavicon(html, finalUrl.origin) ?? fallback.faviconUrl;

		return { title, description, faviconUrl, hostname };
	} catch {
		return fallback;
	}
}
