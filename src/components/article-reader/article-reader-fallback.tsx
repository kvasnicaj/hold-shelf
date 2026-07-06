import { ExternalLink } from "lucide-react";
import { Button } from "#/components/ui/button";

type ArticleReaderFallbackProps = {
	url: string;
	reason: string;
};

export function ArticleReaderFallback({
	url,
	reason,
}: ArticleReaderFallbackProps) {
	return (
		<div className="rounded-lg border bg-muted/30 p-4">
			<p className="text-sm font-medium">Open the original article</p>
			<p className="mt-1 text-sm leading-relaxed text-muted-foreground">
				{reason} Some sites block readers or render the story in a way Hold
				Shelf cannot safely extract yet.
			</p>
			<Button
				asChild
				className="mt-4 border border-border bg-white text-slate-950 shadow-none hover:bg-white/90 hover:text-slate-950 dark:bg-white dark:text-slate-950 dark:hover:bg-white/90"
				size="sm"
			>
				<a href={url} target="_blank" rel="noopener noreferrer">
					<ExternalLink className="h-4 w-4" />
					Original
				</a>
			</Button>
		</div>
	);
}
