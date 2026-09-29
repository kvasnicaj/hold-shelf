import { metadataConfig } from "#/server/config";
import {
	fetchHtmlWithGuards,
	isHtmlContentType,
	readTextWithinLimit,
} from "#/server/external-html";
import { parseReadableArticle } from "#/server/readable-html";
import { extractXArticleMetadata, isXStatusUrl } from "#/server/x-parser";

export type ExtractedArticleContent =
	| {
			status: "ready";
			blocks: ArticleContentBlock[];
			markdown?: string;
			paragraphs: string[];
			wordCount: number;
	  }
	| {
			status: "unavailable";
			refreshError?: string;
			reason: string;
	  };

export type ArticleReaderContent =
	| {
			status: "ready";
			refreshError?: string;
			markdown: string;
			plainText: string;
			wordCount: number;
			fetchedAt: Date;
	  }
	| {
			status: "unavailable";
			refreshError?: string;
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

export async function extractArticleContent(
	url: string,
): Promise<ExtractedArticleContent> {
	try {
		const { response, finalUrl } = await fetchHtmlWithGuards(url);

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
		if (isXStatusUrl(finalUrl) && extractXArticleMetadata(html)) {
			return {
				status: "unavailable",
				reason:
					"X exposes the article preview publicly, but not the complete article body.",
			};
		}
		const { markdown, paragraphs, wordCount } = parseReadableArticle(
			html,
			finalUrl.toString(),
		);

		if (wordCount < 10) {
			return {
				status: "unavailable",
				reason: "Hold Shelf could not extract enough readable text.",
			};
		}

		return {
			status: "ready",
			blocks: [],
			markdown,
			paragraphs,
			wordCount,
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
