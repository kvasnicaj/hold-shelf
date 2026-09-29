import type { Element, Root, RootContent } from "hast";
import { toText } from "hast-util-to-text";
import rehypeParse from "rehype-parse";
import rehypeRemark from "rehype-remark";
import remarkGfm from "remark-gfm";
import remarkStringify from "remark-stringify";
import { unified } from "unified";

const excluded = new Set([
	"script",
	"style",
	"noscript",
	"svg",
	"nav",
	"footer",
	"form",
	"button",
	"iframe",
]);

function findElement(node: Root | Element, tag: string): Element | undefined {
	for (const child of node.children) {
		if (child.type !== "element") continue;
		if (child.tagName === tag) return child;
		const found = findElement(child, tag);
		if (found) return found;
	}
}

function clean(node: Root | Element, base: string) {
	node.children = node.children.filter(
		(child) =>
			child.type !== "element" ||
			(!excluded.has(child.tagName) &&
				!child.properties.hidden &&
				child.properties.ariaHidden !== "true"),
	);
	for (const child of node.children) {
		if (child.type !== "element") continue;
		for (const key of ["href", "src"] as const) {
			const value = child.properties[key];
			if (typeof value !== "string") continue;
			try {
				const url = new URL(value, base);
				if (["https:", "http:"].includes(url.protocol))
					child.properties[key] = url.href;
				else delete child.properties[key];
			} catch {
				delete child.properties[key];
			}
		}
		clean(child, base);
	}
}

export function parseReadableArticle(html: string, base: string) {
	const parser = unified().use(rehypeParse);
	const document = parser.parse(html);
	const selected =
		findElement(document, "article") ??
		findElement(document, "main") ??
		findElement(document, "body");
	const root: Root = {
		type: "root",
		children: selected
			? (selected.children as RootContent[])
			: document.children,
	};
	clean(root, base);
	const plainText = toText(root).trim();
	const converter = unified()
		.use(rehypeRemark)
		.use(remarkGfm)
		.use(remarkStringify);
	const markdown = converter.stringify(converter.runSync(root));
	return {
		markdown,
		paragraphs: plainText.split(/\n\s*\n/).filter(Boolean),
		wordCount: plainText.split(/\s+/).filter(Boolean).length,
	};
}
