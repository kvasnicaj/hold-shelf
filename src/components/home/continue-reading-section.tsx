import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { ArticleExternalLink } from "#/components/articles/article-external-link";
import { ReadingProgressBar } from "#/components/articles/reading-progress-bar";
import { useArticleMutations } from "#/components/articles/use-article-mutations";
import { useAutoMarkReadOnOpen } from "#/components/articles/use-auto-mark-read-on-open";
import { Button } from "#/components/ui/button";
import { getContinueReading } from "#/server/library";

export function ContinueReadingSection() {
	const { data = [] } = useQuery({
		queryKey: ["continue-reading"],
		queryFn: () => getContinueReading(),
	});
	const { handleFinishReading, isPending } = useArticleMutations();
	const { handleOpenArticle } = useAutoMarkReadOnOpen();
	const [lead, ...others] = data;
	if (!lead) return null;
	const leadPercent = Math.round(lead.progress / 100);

	return (
		<section
			aria-label="Continue reading"
			className="rounded-xl border bg-background p-5 sm:p-6"
		>
			<p className="text-xs font-semibold text-muted-foreground">
				Continue reading
			</p>
			<div className="mt-2 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
				<div className="min-w-0 space-y-2.5">
					<ArticleExternalLink
						articleId={lead.id}
						href={lead.url}
						isRead={lead.isRead}
						onOpenArticle={handleOpenArticle}
						className="line-clamp-2 font-serif text-[22px] leading-tight font-semibold text-balance text-foreground no-underline hover:underline"
					>
						{lead.title ?? lead.url}
					</ArticleExternalLink>
					{lead.hostname && (
						<p className="flex items-center gap-2 text-xs text-muted-foreground">
							{lead.faviconUrl && (
								<img
									src={lead.faviconUrl}
									alt=""
									className="size-3.5 rounded-[3px]"
									onError={(event) => {
										event.currentTarget.style.display = "none";
									}}
								/>
							)}
							{lead.hostname}
						</p>
					)}
					<ReadingProgressBar percent={leadPercent} className="max-w-sm" />
					<p className="text-xs tabular-nums text-muted-foreground">
						{leadPercent}% read
					</p>
				</div>
				<div className="flex gap-2">
					<Button
						variant="ghost"
						disabled={isPending}
						onClick={() => void handleFinishReading(lead.id)}
						aria-label={`Mark ${lead.title ?? lead.url} as read`}
					>
						<Check />
						Mark as read
					</Button>
					<Button onClick={() => void handleOpenArticle(lead.id, lead.isRead)}>
						Continue
					</Button>
				</div>
			</div>

			{others.length > 0 && (
				<ul className="mt-5 divide-y border-t">
					{others.map((article) => (
						<li key={article.id} className="flex items-center gap-3 py-2">
							<ArticleExternalLink
								articleId={article.id}
								href={article.url}
								isRead={article.isRead}
								onOpenArticle={handleOpenArticle}
								className="min-w-0 flex-1 truncate text-sm font-medium text-foreground no-underline hover:underline"
							>
								{article.title ?? article.url}
							</ArticleExternalLink>
							<span className="shrink-0 text-xs tabular-nums text-muted-foreground">
								{Math.round(article.progress / 100)}%
							</span>
							<Button
								variant="ghost"
								size="icon-xs"
								disabled={isPending}
								onClick={() => void handleFinishReading(article.id)}
								aria-label={`Mark ${article.title ?? article.url} as read`}
								title="Mark as read"
							>
								<Check className="size-3.5" />
							</Button>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}
