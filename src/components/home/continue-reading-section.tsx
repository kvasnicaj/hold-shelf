import { useQuery } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { ArticleExternalLink } from "#/components/articles/article-external-link";
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
	if (!data.length) return null;
	return (
		<section
			aria-label="Continue reading"
			className="rounded-2xl border border-primary/20 bg-primary/5 p-5"
		>
			<h2 className="display-title mb-4 text-xl font-semibold">
				Continue reading
			</h2>
			<div className="grid gap-3 lg:grid-cols-2">
				{data.map((article) => (
					<div
						key={article.id}
						className="flex flex-col gap-3 rounded-lg bg-background p-4 shadow-sm"
					>
						<ArticleExternalLink
							articleId={article.id}
							href={article.url}
							isRead={article.isRead}
							onOpenArticle={handleOpenArticle}
							className="block min-w-0 flex-1 no-underline"
						>
							<span className="line-clamp-2 font-medium">
								{article.title ?? article.url}
							</span>
							<span className="mt-2 block text-xs text-muted-foreground">
								{Math.round(article.progress / 100)}% read
							</span>
							<progress
								className="mt-2 h-1 w-full accent-primary"
								value={article.progress}
								max={10000}
								aria-label="Reading progress"
							/>
						</ArticleExternalLink>
						<Button
							size="sm"
							variant="outline"
							className="self-end"
							disabled={isPending}
							onClick={() => void handleFinishReading(article.id)}
							aria-label={`Mark ${article.title ?? article.url} as read`}
						>
							<Check className="size-4" />
							Mark as read
						</Button>
					</div>
				))}
			</div>
		</section>
	);
}
