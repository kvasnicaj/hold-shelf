import { ArrowSquareOut } from "@phosphor-icons/react";
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
		<div className="rounded-lg border bg-background p-5 font-sans">
			<p className="font-serif text-lg font-semibold">
				Open the original article
			</p>
			<p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
				{reason} Some sites block readers or render the story in a way Hold
				Shelf cannot safely extract yet.
			</p>
			<Button asChild variant="outline" size="sm" className="mt-4">
				<a href={url} target="_blank" rel="noopener noreferrer">
					<ArrowSquareOut />
					Open original
				</a>
			</Button>
		</div>
	);
}
