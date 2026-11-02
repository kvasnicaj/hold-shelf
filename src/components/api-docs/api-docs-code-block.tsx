type ApiDocsCodeBlockProps = {
	label?: string;
	code: string;
};

export function ApiDocsCodeBlock({ label, code }: ApiDocsCodeBlockProps) {
	return (
		<div className="min-w-0 space-y-2">
			{label && (
				<p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
					{label}
				</p>
			)}
			<pre
				// biome-ignore lint/a11y/noNoninteractiveTabindex: Overflowing code blocks need keyboard scrolling.
				tabIndex={0}
				className="overflow-x-auto rounded-md border bg-muted/40 p-3 text-xs leading-6 text-foreground focus-visible:outline-2 focus-visible:outline-ring"
			>
				<code>{code}</code>
			</pre>
		</div>
	);
}
