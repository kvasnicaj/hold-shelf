import remarkParse from "remark-parse";
import { unified } from "unified";
import guide from "../../../docs/cli-guide.md?raw";

const headings = unified()
	.use(remarkParse)
	.parse(guide)
	.children.filter((node) => node.type === "heading" && node.depth === 2);

export const CLI_DOCS_SECTIONS = headings.map((heading, index) => ({
	title: guide
		.slice(heading.position?.start.offset, heading.position?.end.offset)
		.replace(/^##\s+/, ""),
	content: guide.slice(
		heading.position?.end.offset,
		headings[index + 1]?.position?.start.offset,
	),
}));
