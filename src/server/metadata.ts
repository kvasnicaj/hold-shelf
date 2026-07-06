import { metadataConfig } from "#/server/config";
import {
	fetchHtmlWithGuards,
	isHtmlContentType,
	readTextWithinLimit,
} from "#/server/external-html";
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
	} catch (error) {
		console.warn("Metadata extraction fell back to hostname metadata.", {
			url,
			error: error instanceof Error ? error.message : String(error),
		});
		return fallback;
	}
}
