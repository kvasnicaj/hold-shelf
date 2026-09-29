import type {
	ArticleContentBlock,
	ArticleInlineNode,
	ExtractedArticleContent,
} from "#/server/article-content";

function escapeMarkdownText(text: string): string {
	return text.replace(/[\\`*_{}[\]()#+\-.!|>]/g, "\\$&");
}

function escapeInlineCode(text: string): string {
	const tickRuns = text.match(/`+/g) ?? [];
	const longestTickRun = Math.max(0, ...tickRuns.map((run) => run.length));
	const fence = "`".repeat(longestTickRun + 1);
	const padding = text.startsWith(" ") || text.endsWith(" ") ? " " : "";
	return `${fence}${padding}${text}${padding}${fence}`;
}

function getCodeFence(text: string): string {
	const fenceRuns = text.match(/`{3,}/g) ?? [];
	const longestFenceRun = Math.max(2, ...fenceRuns.map((run) => run.length));
	return "`".repeat(longestFenceRun + 1);
}

function inlineNodeToMarkdown(node: ArticleInlineNode): string {
	if (node.code) {
		return escapeInlineCode(node.text);
	}

	let content = escapeMarkdownText(node.text);

	if (node.bold) {
		content = `**${content}**`;
	}

	if (node.italic) {
		content = `_${content}_`;
	}

	if (node.href) {
		content = `[${content}](${node.href})`;
	}

	return content;
}

function inlineNodesToMarkdown(nodes: ArticleInlineNode[]): string {
	return nodes.map(inlineNodeToMarkdown).join("").trim();
}

function inlineNodesToText(nodes: ArticleInlineNode[]): string {
	return nodes
		.map((node) => node.text)
		.join("")
		.replace(/\s+/g, " ")
		.trim();
}

function blockToMarkdown(block: ArticleContentBlock): string {
	if (block.type === "heading") {
		return `${"#".repeat(block.level)} ${inlineNodesToMarkdown(block.children)}`;
	}

	if (block.type === "blockquote") {
		return inlineNodesToMarkdown(block.children)
			.split("\n")
			.map((line) => `> ${line}`)
			.join("\n");
	}

	if (block.type === "list") {
		return block.items
			.map((item) => `- ${inlineNodesToMarkdown(item)}`)
			.join("\n");
	}

	if (block.type === "code") {
		const fence = getCodeFence(block.text);
		return `${fence}\n${block.text}\n${fence}`;
	}

	return inlineNodesToMarkdown(block.children);
}

function blockToPlainText(block: ArticleContentBlock): string {
	if (block.type === "code") {
		return block.text;
	}

	if (block.type === "list") {
		return block.items.map(inlineNodesToText).join("\n");
	}

	return inlineNodesToText(block.children);
}

export function articleBlocksToMarkdown(blocks: ArticleContentBlock[]): string {
	return blocks
		.map(blockToMarkdown)
		.filter((block) => block.length > 0)
		.join("\n\n");
}

export function articleBlocksToPlainText(
	blocks: ArticleContentBlock[],
): string {
	return blocks
		.map(blockToPlainText)
		.filter((block) => block.length > 0)
		.join("\n\n");
}

export function extractedArticleToMarkdown(content: ExtractedArticleContent): {
	markdown: string;
	plainText: string;
	wordCount: number;
} | null {
	if (content.status !== "ready") {
		return null;
	}

	const markdown =
		content.markdown ??
		(content.blocks.length > 0
			? articleBlocksToMarkdown(content.blocks)
			: content.paragraphs.map(escapeMarkdownText).join("\n\n"));
	const plainText =
		content.blocks.length > 0
			? articleBlocksToPlainText(content.blocks)
			: content.paragraphs.join("\n\n");

	if (!markdown.trim() || !plainText.trim()) {
		return null;
	}

	return {
		markdown,
		plainText,
		wordCount: content.wordCount,
	};
}
