import { ArticleStateMarks } from "#/components/articles/article-state-marks";
import { ReadingProgressBar } from "#/components/articles/reading-progress-bar";
import { LANDING_PREVIEW } from "#/components/home/helpers";

/**
 * A still of the app built from its own pieces: the continue-reading line and
 * an Unread list with spines. Purely illustrative, so it is hidden from
 * assistive technology and has no controls.
 */
export function LandingPreview() {
	const { continueReading, unread } = LANDING_PREVIEW;

	return (
		<figure className="m-0">
			<div
				aria-hidden="true"
				className="pointer-events-none overflow-hidden rounded-xl border bg-card select-none"
			>
				<div className="space-y-2.5 border-b px-5 pt-5 pb-5">
					<p className="text-xs font-semibold text-muted-foreground">
						Continue reading
					</p>
					<p className="font-serif text-[1.375rem] leading-tight font-semibold">
						{continueReading.title}
					</p>
					<p className="text-meta text-muted-foreground">
						{continueReading.hostname}
					</p>
					<ReadingProgressBar
						percent={continueReading.percent}
						className="max-w-xs"
					/>
					<p className="text-meta tabular-nums text-muted-foreground">
						{continueReading.note}
					</p>
				</div>
				<div className="flex items-baseline gap-2 px-5 pt-4 pb-1">
					<p className="font-serif text-lg font-semibold">Unread</p>
					<p className="text-meta tabular-nums text-muted-foreground">
						{unread.length} articles
					</p>
				</div>
				<ul className="divide-y">
					{unread.map((article) => (
						<li
							key={article.title}
							className="flex items-start gap-3 px-5 py-3.5"
						>
							<ArticleStateMarks
								isRead={false}
								isFavorite={article.isFavorite}
								className="mt-0.5"
							/>
							<div className="min-w-0 space-y-1">
								<p className="text-[15px] leading-snug font-semibold">
									{article.title}
								</p>
								<p className="text-meta text-muted-foreground">
									{article.hostname} · {article.note}
								</p>
							</div>
						</li>
					))}
				</ul>
			</div>
			<figcaption className="mt-3 text-meta text-muted-foreground">
				A teal spine marks what you haven’t read; the bookmark marks a favorite.
			</figcaption>
		</figure>
	);
}
