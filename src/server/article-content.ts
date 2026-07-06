import { metadataConfig } from "#/server/config";
import {
	fetchHtmlWithGuards,
	isHtmlContentType,
	readTextWithinLimit,
} from "#/server/external-html";
import { decodeHtmlEntities } from "#/server/html-parsing";

export type ArticleReaderContent =
	| {
			status: "ready";
			blocks: ArticleContentBlock[];
			paragraphs: string[];
			wordCount: number;
	  }
	| {
			status: "unavailable";
			reason: string;
	  };

export type ArticleInlineNode = {
	text: string;
	bold?: boolean;
	italic?: boolean;
	code?: boolean;
	href?: string;
};

export type ArticleContentBlock =
	| {
			type: "heading";
			level: 2 | 3 | 4;
			children: ArticleInlineNode[];
	  }
	| {
			type: "paragraph";
			children: ArticleInlineNode[];
	  }
	| {
			type: "blockquote";
			children: ArticleInlineNode[];
	  }
	| {
			type: "list";
			items: ArticleInlineNode[][];
	  }
	| {
			type: "code";
			text: string;
	  };

const BLOCK_BREAK_TAGS =
	/<\/?(?:article|aside|blockquote|br|div|figcaption|figure|h[1-6]|li|main|p|pre|section)[^>]*>/gi;
const CONTENT_BLOCK_PATTERN =
	/<(?<tag>h[1-6]|p|li|pre|blockquote)\b[^>]*>(?<content>[\s\S]*?)<\/\k<tag>>/gi;
const INLINE_TOKEN_PATTERN =
	/<\/?(?:strong|b|em|i|code)\b[^>]*>|<a\b[^>]*href=(?<quote>["'])(?<href>.*?)\k<quote>[^>]*>|<\/a>|<[^>]+>|[^<]+/gi;

function pickReadableHtml(html: string): string {
	const articleMatch = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i);
	const mainMatch = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
	const bodyMatch = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
	return articleMatch?.[1] ?? mainMatch?.[1] ?? bodyMatch?.[1] ?? html;
}

function cleanReadableHtml(html: string): string {
	return pickReadableHtml(html)
		.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
		.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
		.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, " ")
		.replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, " ")
		.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, " ")
		.replace(/<header\b[^>]*>[\s\S]*?<\/header>/gi, " ")
		.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi, " ");
}

function getTextContent(html: string): string {
	return decodeHtmlEntities(html.replace(/<[^>]+>/g, " "))
		.replace(/\s+/g, " ")
		.trim();
}

function getHrefFromToken(token: string): string | undefined {
	const match = token.match(/<a\b[^>]*href=(["'])(.*?)\1/i);
	if (!match?.[2]) {
		return undefined;
	}

	const href = decodeHtmlEntities(match[2]).trim();

	try {
		const parsed = new URL(href);
		return ["http:", "https:"].includes(parsed.protocol)
			? parsed.toString()
			: undefined;
	} catch {
		return undefined;
	}
}

function htmlToInlineNodes(html: string): ArticleInlineNode[] {
	const nodes: ArticleInlineNode[] = [];
	const state = {
		bold: 0,
		italic: 0,
		code: 0,
		href: undefined as string | undefined,
	};

	for (const match of html.matchAll(INLINE_TOKEN_PATTERN)) {
		const token = match[0];
		const lowerToken = token.toLowerCase();

		if (lowerToken.startsWith("<strong") || lowerToken.startsWith("<b")) {
			state.bold += 1;
			continue;
		}
		if (lowerToken.startsWith("</strong") || lowerToken.startsWith("</b")) {
			state.bold = Math.max(0, state.bold - 1);
			continue;
		}
		if (lowerToken.startsWith("<em") || lowerToken.startsWith("<i")) {
			state.italic += 1;
			continue;
		}
		if (lowerToken.startsWith("</em") || lowerToken.startsWith("</i")) {
			state.italic = Math.max(0, state.italic - 1);
			continue;
		}
		if (lowerToken.startsWith("<code")) {
			state.code += 1;
			continue;
		}
		if (lowerToken.startsWith("</code")) {
			state.code = Math.max(0, state.code - 1);
			continue;
		}
		if (lowerToken.startsWith("<a")) {
			state.href = getHrefFromToken(token);
			continue;
		}
		if (lowerToken.startsWith("</a")) {
			state.href = undefined;
			continue;
		}
		if (token.startsWith("<")) {
			continue;
		}

		const text = decodeHtmlEntities(token).replace(/\s+/g, " ");
		if (!text.trim()) {
			continue;
		}

		nodes.push({
			text,
			bold: state.bold > 0 || undefined,
			italic: state.italic > 0 || undefined,
			code: state.code > 0 || undefined,
			href: state.href,
		});
	}

	return nodes;
}

function inlineNodesToText(nodes: ArticleInlineNode[]): string {
	return nodes
		.map((node) => node.text)
		.join("")
		.replace(/\s+/g, " ")
		.trim();
}

function htmlToBlocks(html: string): ArticleContentBlock[] {
	const readableHtml = cleanReadableHtml(html);
	const blocks: ArticleContentBlock[] = [];
	let pendingListItems: ArticleInlineNode[][] = [];

	function flushList() {
		if (pendingListItems.length > 0) {
			blocks.push({ type: "list", items: pendingListItems });
			pendingListItems = [];
		}
	}

	for (const match of readableHtml.matchAll(CONTENT_BLOCK_PATTERN)) {
		const tag = match.groups?.tag?.toLowerCase();
		const content = match.groups?.content ?? "";
		const text = getTextContent(content);

		if (!tag || text.length < 2) {
			continue;
		}

		if (tag === "pre") {
			flushList();
			blocks.push({ type: "code", text });
			continue;
		}

		const children = htmlToInlineNodes(content);
		if (inlineNodesToText(children).length < 2) {
			continue;
		}

		if (tag === "li") {
			pendingListItems.push(children);
			continue;
		}

		flushList();

		if (tag.startsWith("h")) {
			const rawLevel = Number(tag.slice(1));
			const level = Math.min(Math.max(rawLevel, 2), 4) as 2 | 3 | 4;
			blocks.push({ type: "heading", level, children });
			continue;
		}

		if (tag === "blockquote") {
			blocks.push({ type: "blockquote", children });
			continue;
		}

		if (text.length >= 24) {
			blocks.push({ type: "paragraph", children });
		}
	}

	flushList();
	return blocks.slice(0, 120);
}

function htmlToParagraphs(html: string): string[] {
	const readableHtml = cleanReadableHtml(html)
		.replace(BLOCK_BREAK_TAGS, "\n")
		.replace(/<[^>]+>/g, " ");

	return decodeHtmlEntities(readableHtml)
		.replace(/\r/g, "\n")
		.split(/\n{1,}/)
		.map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
		.filter((paragraph) => paragraph.length >= 48)
		.slice(0, 80);
}

function blocksToParagraphs(blocks: ArticleContentBlock[]): string[] {
	return blocks
		.flatMap((block) => {
			if (block.type === "code") {
				return [block.text];
			}
			if (block.type === "list") {
				return block.items.map(inlineNodesToText);
			}
			return [inlineNodesToText(block.children)];
		})
		.filter((text) => text.length >= 24)
		.slice(0, 80);
}

function countWords(paragraphs: string[]): number {
	return paragraphs.reduce(
		(total, paragraph) =>
			total + paragraph.split(/\s+/).filter((word) => word.length > 0).length,
		0,
	);
}

export async function extractArticleContent(
	url: string,
): Promise<ArticleReaderContent> {
	try {
		const { response } = await fetchHtmlWithGuards(url);

		if (!response.ok) {
			return {
				status: "unavailable",
				reason: "The original site did not return a readable page.",
			};
		}

		if (!isHtmlContentType(response.headers.get("content-type"))) {
			return {
				status: "unavailable",
				reason: "The original link is not an HTML article.",
			};
		}

		const html = await readTextWithinLimit(response, metadataConfig.maxBytes);
		const blocks = htmlToBlocks(html);
		const paragraphs =
			blocks.length > 0 ? blocksToParagraphs(blocks) : htmlToParagraphs(html);

		if (paragraphs.length < 2) {
			return {
				status: "unavailable",
				reason: "Hold Shelf could not extract enough readable text.",
			};
		}

		return {
			status: "ready",
			blocks,
			paragraphs,
			wordCount: countWords(paragraphs),
		};
	} catch (error) {
		console.warn("Article content extraction failed.", {
			url,
			error: error instanceof Error ? error.message : String(error),
		});
		return {
			status: "unavailable",
			reason: "The article could not be loaded from the original site.",
		};
	}
}
