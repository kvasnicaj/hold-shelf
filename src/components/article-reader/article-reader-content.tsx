import type {
	ArticleContentBlock,
	ArticleInlineNode,
} from "#/server/article-content";

type ArticleReaderContentProps = {
	blocks?: ArticleContentBlock[];
	paragraphs: string[];
};

export function ArticleReaderContent({
	blocks,
	paragraphs,
}: ArticleReaderContentProps) {
	if (blocks && blocks.length > 0) {
		return (
			<div className="font-serif text-[1.02rem] leading-8 text-foreground/90">
				{blocks.map((block, index) => (
					<ArticleReaderBlock block={block} key={getBlockKey(block, index)} />
				))}
			</div>
		);
	}

	return (
		<div className="font-serif text-[1.02rem] leading-8 text-foreground/90">
			{paragraphs.map((paragraph) => (
				<p key={paragraph} className="mb-5">
					{paragraph}
				</p>
			))}
		</div>
	);
}

function ArticleReaderBlock({ block }: { block: ArticleContentBlock }) {
	if (block.type === "heading") {
		const Heading = `h${block.level}` as "h2" | "h3" | "h4";
		return (
			<Heading className="mb-3 mt-7 font-sans font-semibold leading-tight text-foreground">
				<ArticleInlineContent nodes={block.children} />
			</Heading>
		);
	}

	if (block.type === "blockquote") {
		return (
			<blockquote className="mb-5 border-l-2 border-primary/40 pl-4 text-foreground/80 italic">
				<ArticleInlineContent nodes={block.children} />
			</blockquote>
		);
	}

	if (block.type === "list") {
		return (
			<ul className="mb-5 list-disc space-y-2 pl-6">
				{block.items.map((item, index) => (
					<li key={getInlineNodesKey(item, index)}>
						<ArticleInlineContent nodes={item} />
					</li>
				))}
			</ul>
		);
	}

	if (block.type === "code") {
		return (
			<pre className="mb-5 overflow-x-auto rounded-md border bg-muted/40 p-4 font-mono text-sm leading-6 text-foreground">
				<code>{block.text}</code>
			</pre>
		);
	}

	return (
		<p className="mb-5">
			<ArticleInlineContent nodes={block.children} />
		</p>
	);
}

function ArticleInlineContent({ nodes }: { nodes: ArticleInlineNode[] }) {
	return (
		<>
			{nodes.map((node, index) => (
				<ArticleInlineNodeView
					node={node}
					key={getInlineNodeKey(node, index)}
				/>
			))}
		</>
	);
}

function ArticleInlineNodeView({ node }: { node: ArticleInlineNode }) {
	let content: React.ReactNode = node.text;

	if (node.code) {
		content = (
			<code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.9em]">
				{content}
			</code>
		);
	}

	if (node.bold) {
		content = (
			<strong className="font-semibold text-foreground">{content}</strong>
		);
	}

	if (node.italic) {
		content = <em>{content}</em>;
	}

	if (node.href) {
		return (
			<a href={node.href} target="_blank" rel="noopener noreferrer">
				{content}
			</a>
		);
	}

	return <>{content}</>;
}

function getInlineNodeKey(node: ArticleInlineNode, index: number) {
	return [
		node.text,
		node.href ?? "",
		node.bold ? "bold" : "",
		node.italic ? "italic" : "",
		node.code ? "code" : "",
		index,
	].join("-");
}

function getInlineNodesKey(nodes: ArticleInlineNode[], index: number) {
	return `${nodes
		.map((node) => node.text)
		.join("")
		.slice(0, 64)}-${index}`;
}

function getBlockKey(block: ArticleContentBlock, index: number) {
	if (block.type === "code") {
		return `code-${block.text.slice(0, 64)}-${index}`;
	}

	if (block.type === "list") {
		return `list-${block.items
			.map((item) => item.map((node) => node.text).join(""))
			.join("")
			.slice(0, 64)}-${index}`;
	}

	return `${block.type}-${block.children
		.map((node) => node.text)
		.join("")
		.slice(0, 64)}-${index}`;
}
