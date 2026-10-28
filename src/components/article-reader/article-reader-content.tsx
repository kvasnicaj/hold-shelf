import { renderMarkdownToReact } from "#/components/article-reader/markdown-rendering";

type ArticleReaderContentProps = {
	markdown: string;
};

export function ArticleReaderContent({ markdown }: ArticleReaderContentProps) {
	return (
		<div className="prose prose-hold max-w-none text-[1em] leading-[1.65] text-pretty prose-headings:font-semibold prose-headings:text-balance prose-a:underline-offset-[3px] prose-code:font-mono prose-code:text-[0.88em] prose-pre:rounded-lg prose-pre:border">
			{renderMarkdownToReact(markdown)}
		</div>
	);
}
