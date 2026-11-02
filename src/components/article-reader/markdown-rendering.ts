import parse, {
	type DOMNode,
	domToReact,
	Element,
	type HTMLReactParserOptions,
} from "html-react-parser";
import { createElement, type ReactNode } from "react";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

export function renderMarkdownToHtml(markdown: string): string {
	// Let keyboard users scroll overflowing code after the content is sanitized.
	return String(
		unified()
			.use(remarkParse)
			.use(remarkGfm)
			.use(remarkRehype)
			.use(rehypeSlug)
			.use(rehypeSanitize)
			.use(rehypeStringify)
			.processSync(markdown),
	).replaceAll("<pre>", '<pre tabindex="0">');
}

function renderChildren(
	children: DOMNode[],
	options: HTMLReactParserOptions,
): ReactNode {
	return domToReact(children, options);
}

export function renderMarkdownToReact(markdown: string): ReactNode {
	const html = renderMarkdownToHtml(markdown);
	const options: HTMLReactParserOptions = {
		replace: (domNode) => {
			if (!(domNode instanceof Element)) {
				return undefined;
			}

			if (domNode.name === "a") {
				return createElement(
					"a",
					{
						href: domNode.attribs.href,
						target: "_blank",
						rel: "noopener noreferrer",
					},
					renderChildren(domNode.children as DOMNode[], options),
				);
			}

			if (domNode.name === "img") {
				return createElement("img", {
					...domNode.attribs,
					loading: "lazy",
					referrerPolicy: "no-referrer",
					alt: domNode.attribs.alt ?? "",
				});
			}

			return undefined;
		},
	};

	return parse(html, options);
}
