import { renderMarkdownToReact } from "#/components/article-reader/markdown-rendering";

type ArticleReaderContentProps = {
	markdown: string;
};

export function ArticleReaderContent({ markdown }: ArticleReaderContentProps) {
	return (
		<div className="prose prose-neutral max-w-none font-serif text-[1em] leading-[1.8] text-foreground/90 prose-a:text-primary prose-blockquote:border-primary/40 prose-blockquote:text-foreground/80 prose-code:font-mono prose-code:text-[0.9em] prose-pre:border prose-pre:bg-muted/40 dark:prose-invert">
			{renderMarkdownToReact(markdown)}
		</div>
	);
}
