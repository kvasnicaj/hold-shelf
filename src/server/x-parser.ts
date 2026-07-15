import { decodeHtmlEntities } from "#/server/html-parsing";

type XArticleMetadata = {
	title: string;
	description: string;
};

const X_HOSTNAMES = new Set([
	"x.com",
	"www.x.com",
	"mobile.x.com",
	"twitter.com",
	"www.twitter.com",
	"mobile.twitter.com",
]);

const X_STATUS_PATH_PATTERN = /^\/[^/]+\/status\/\d+\/?$/;
const X_ARTICLE_ENTITY_PATTERN = /__typename:"ArticleEntity"[\s\S]{0,2500}/;
const JS_STRING_FIELD_PATTERNS = {
	title: /(?:^|,)title:"((?:\\.|[^"\\])*)"/,
	description: /(?:^|,)preview_text:"((?:\\.|[^"\\])*)"/,
};

export function isXStatusUrl(url: URL): boolean {
	return (
		X_HOSTNAMES.has(url.hostname.toLowerCase()) &&
		X_STATUS_PATH_PATTERN.test(url.pathname)
	);
}

function decodeJavaScriptString(value: string): string | null {
	try {
		return JSON.parse(`"${value}"`);
	} catch {
		return null;
	}
}

export function extractXArticleMetadata(html: string): XArticleMetadata | null {
	const entity = html.match(X_ARTICLE_ENTITY_PATTERN)?.[0];
	if (!entity) return null;

	const rawTitle = entity.match(JS_STRING_FIELD_PATTERNS.title)?.[1];
	const rawDescription = entity.match(
		JS_STRING_FIELD_PATTERNS.description,
	)?.[1];
	if (!rawTitle || !rawDescription) return null;

	const title = decodeJavaScriptString(rawTitle);
	const description = decodeJavaScriptString(rawDescription);
	if (!title?.trim() || !description?.trim()) return null;

	return {
		title: decodeHtmlEntities(title).trim(),
		description: decodeHtmlEntities(description).trim(),
	};
}
