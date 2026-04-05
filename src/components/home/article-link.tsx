import { ExternalLink } from "lucide-react";

type ArticleLinkProps = {
	article: {
		id: string;
		url: string;
		title: string | null;
		hostname: string | null;
		faviconUrl: string | null;
	};
};

export function ArticleLink({ article }: ArticleLinkProps) {
	return (
		<a
			href={article.url}
			target="_blank"
			rel="noopener noreferrer"
			className="flex items-center gap-2 rounded-md p-2 text-sm no-underline transition-colors hover:bg-accent"
		>
			{article.faviconUrl && (
				<img
					src={article.faviconUrl}
					alt=""
					className="h-4 w-4 shrink-0"
					onError={(e) => {
						e.currentTarget.style.display = "none";
					}}
				/>
			)}
			<span className="min-w-0 truncate">
				{article.title ?? article.hostname}
			</span>
			<ExternalLink className="ml-auto h-3 w-3 shrink-0 text-muted-foreground" />
		</a>
	);
}
