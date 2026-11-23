import { CaretRight, Check } from "@phosphor-icons/react";
import { ArticleExternalLink } from "#/components/articles/article-external-link";
import { ReadingProgressBar } from "#/components/articles/reading-progress-bar";
import { useArticleMutations } from "#/components/articles/use-article-mutations";
import { useOpenArticle } from "#/components/articles/use-open-article";
import { ArticleSource } from "#/components/home/article-source";
import type { InProgressArticle } from "#/components/home/types";
import { Button } from "#/components/ui/button";

type ContinueReadingSectionProps = {
	articles: InProgressArticle[];
};

export function ContinueReadingSection({
	articles,
}: ContinueReadingSectionProps) {
	const { handleFinishReading, isPending } = useArticleMutations();
	const { handleOpenArticle } = useOpenArticle();
	const [lead, ...others] = articles;
	if (!lead) return null;
	const leadPercent = Math.round(lead.progress / 100);

	return (
		<section
			aria-label="Continue reading"
			className="relative rounded-lg bg-card py-3 pr-11 pl-4 md:rounded-xl md:border md:bg-background md:p-6"
		>
			<p className="text-xs font-semibold text-muted-foreground">
				Continue reading
			</p>
			<div className="mt-1 grid gap-4 md:mt-2 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
				<div className="min-w-0 md:space-y-2.5">
					<ArticleExternalLink
						articleId={lead.id}
						href={lead.url}
						isRead={lead.isRead}
						onOpenArticle={handleOpenArticle}
						className="block font-serif text-lg leading-tight font-semibold text-foreground no-underline after:absolute after:inset-0 after:rounded-lg hover:underline focus-visible:after:outline-2 focus-visible:after:outline-ring md:text-[22px] md:text-balance md:after:hidden"
					>
						<span className="line-clamp-2 wrap-anywhere">
							{lead.title ?? lead.url}
						</span>
						<CaretRight
							aria-hidden="true"
							className="absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted-foreground md:hidden"
						/>
					</ArticleExternalLink>
					<div className="mt-1 flex min-w-0 items-center gap-1.5 text-meta text-muted-foreground md:block md:space-y-2.5">
						<ArticleSource article={lead} />
						<span aria-hidden="true" className="md:hidden">
							·
						</span>
						<ReadingProgressBar
							percent={leadPercent}
							className="hidden max-w-sm md:block"
						/>
						<span className="shrink-0 tabular-nums md:block">
							{leadPercent}% read
						</span>
					</div>
				</div>
				<div className="hidden gap-2 md:flex">
					<Button
						variant="ghost"
						disabled={isPending}
						onClick={() => void handleFinishReading(lead.id)}
						aria-label={`Mark as read: ${lead.title ?? lead.url}`}
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
				<ul className="mt-5 hidden divide-y border-t md:block">
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
