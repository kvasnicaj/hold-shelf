import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { ArticleReaderContent } from "#/components/article-reader/article-reader-content";
import { ArticleReaderFallback } from "#/components/article-reader/article-reader-fallback";
import { ArticleReaderMetadata } from "#/components/article-reader/article-reader-metadata";
import { withoutRepeatedTitle } from "#/components/article-reader/helpers";
import type { ArticleReaderRecord } from "#/server/articles-service";
import { getReadingProgress, saveReadingProgress } from "#/server/library";

type ReaderBodyProps = {
	data: ArticleReaderRecord;
	fontSize: number;
};
export function ReaderBody({ data, fontSize }: ReaderBodyProps) {
	const client = useQueryClient();
	const saves = useRef(Promise.resolve());
	const scroll = useRef<HTMLDivElement>(null);
	const restored = useRef(false);
	const { data: progress } = useQuery({
		queryKey: ["reading-progress", data.article.id],
		staleTime: 30_000,
		queryFn: () => getReadingProgress({ data: { id: data.article.id } }),
	});
	useEffect(() => {
		if (
			progress === undefined ||
			!scroll.current ||
			restored.current ||
			data.content.status !== "ready"
		)
			return;
		scroll.current.scrollTop =
			((scroll.current.scrollHeight - scroll.current.clientHeight) * progress) /
			10000;
		restored.current = true;
	}, [progress, data.content.status]);
	useEffect(() => {
		const element = scroll.current;
		if (!element) return;
		let pending: number | null = null;
		let timer: ReturnType<typeof setTimeout> | undefined;
		const flush = () => {
			if (pending === null) return;
			const value = pending;
			pending = null;
			client.setQueryData(["reading-progress", data.article.id], value);
			// Serialize writes so a slow earlier request cannot overwrite a newer position.
			saves.current = saves.current
				.then(() =>
					saveReadingProgress({
						data: { id: data.article.id, progress: value },
					}),
				)
				.then(() => {
					void client.invalidateQueries({ queryKey: ["continue-reading"] });
				})
				.catch(() => {
					void client.invalidateQueries({
						queryKey: ["reading-progress", data.article.id],
					});
					toast.error("Reading position could not be saved.", {
						id: "reading-progress-error",
					});
				});
		};
		const onScroll = () => {
			if (!restored.current) return;
			const range = element.scrollHeight - element.clientHeight;
			if (range <= 0) return;
			pending = Math.max(
				0,
				Math.min(10000, Math.round((element.scrollTop / range) * 10000)),
			);
			clearTimeout(timer);
			timer = setTimeout(flush, 800);
		};
		element.addEventListener("scroll", onScroll, { passive: true });
		window.addEventListener("pagehide", flush);
		return () => {
			clearTimeout(timer);
			flush();
			element.removeEventListener("scroll", onScroll);
			window.removeEventListener("pagehide", flush);
		};
	}, [client, data.article.id]);
	return (
		<div
			ref={scroll}
			className="min-h-0 flex-1 overflow-y-auto px-5 py-8 sm:px-8"
		>
			<article
				className="mx-auto w-full"
				style={{ maxWidth: "70ch", fontSize: `${fontSize}px` }}
			>
				<header className="mb-8 space-y-3">
					<h1 className="display-title text-3xl font-bold leading-tight">
						{data.article.title ?? data.article.url}
					</h1>
					<ArticleReaderMetadata payload={data} />
				</header>
				{data.content.status === "ready" ? (
					<ArticleReaderContent
						markdown={withoutRepeatedTitle(
							data.content.markdown,
							data.article.title,
						)}
					/>
				) : (
					<ArticleReaderFallback
						url={data.article.url}
						reason={data.content.reason}
					/>
				)}
			</article>
		</div>
	);
}
