type ApiDocsCodeBlockProps = {
	label: string;
	code: string;
};

export function ApiDocsCodeBlock({ label, code }: ApiDocsCodeBlockProps) {
	return (
		<div className="space-y-2">
			<p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
				{label}
			</p>
			<pre className="overflow-x-auto rounded-md border bg-muted/40 p-3 text-xs leading-6 text-foreground">
				<code>{code}</code>
			</pre>
		</div>
	);
}
