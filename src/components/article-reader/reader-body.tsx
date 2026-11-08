import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ArticleReaderContent } from "#/components/article-reader/article-reader-content";
import { ArticleReaderFallback } from "#/components/article-reader/article-reader-fallback";
import { ArticleReaderMetadata } from "#/components/article-reader/article-reader-metadata";
import {
	READ_AT_END_PROGRESS,
	READER_MEASURES,
	splitRepeatedTitle,
} from "#/components/article-reader/helpers";
import type { ReaderSettings } from "#/components/article-reader/types";
import { cn } from "#/lib/utils";
import type { ArticleReaderRecord } from "#/server/articles-service";
import {
	finishReading,
	getReadingProgress,
	saveReadingProgress,
} from "#/server/library";

type ReaderBodyProps = {
	data: ArticleReaderRecord;
	settings: ReaderSettings;
};
export function ReaderBody({ data, settings }: ReaderBodyProps) {
	const client = useQueryClient();
	const saves = useRef<Promise<unknown>>(Promise.resolve());
	const scroll = useRef<HTMLDivElement>(null);
	const restored = useRef(false);
	const [readPercent, setReadPercent] = useState(0);
	const shown =
		data.content.status === "ready"
			? splitRepeatedTitle(data.content.markdown, data.article.title)
			: { title: data.article.title, markdown: "" };
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
		setReadPercent(progress / 100);
	}, [progress, data.content.status]);
	useEffect(() => {
		const element = scroll.current;
		if (!element) return;
		let pending: number | null = null;
		let finished = data.article.isRead;
		let timer: ReturnType<typeof setTimeout> | undefined;
		// One queue owns every progress write for this reader, so a slow earlier
		// position save can never land after (and overwrite) a newer one or the
		// atomic finish, which writes read status and 100% progress together.
		const enqueue = (write: () => Promise<unknown>) => {
			saves.current = saves.current.then(write).then(
				() => true,
				() => {
					void client.invalidateQueries({
						queryKey: ["reading-progress", data.article.id],
					});
					return false;
				},
			);
			return saves.current;
		};
		const flush = () => {
			if (pending === null) return;
			const value = pending;
			pending = null;
			client.setQueryData(["reading-progress", data.article.id], value);
			void enqueue(() =>
				saveReadingProgress({
					data: { id: data.article.id, progress: value },
				}),
			).then((saved) => {
				if (saved) {
					void client.invalidateQueries({ queryKey: ["continue-reading"] });
					return;
				}
				toast.error("Reading position could not be saved.", {
					id: "reading-progress-error",
				});
			});
		};
		const finish = () => {
			finished = true;
			// Finishing supersedes the position that triggered it.
			clearTimeout(timer);
			pending = null;
			client.setQueryData(["reading-progress", data.article.id], 10000);
			void enqueue(() => finishReading({ data: { id: data.article.id } })).then(
				(done) => {
					if (!done) {
						finished = false;
						toast.error("This article could not be marked as read.", {
							id: "read-at-end-error",
						});
						return;
					}
					void client.invalidateQueries({ queryKey: ["articles"] });
					void client.invalidateQueries({
						queryKey: ["article-reader", data.article.id],
					});
					void client.invalidateQueries({ queryKey: ["continue-reading"] });
					toast.success("Marked as read", { id: "read-at-end" });
				},
			);
		};
		const onScroll = () => {
			const range = element.scrollHeight - element.clientHeight;
			if (range <= 0) return;
			setReadPercent((element.scrollTop / range) * 100);
			if (!restored.current) return;
			pending = Math.max(
				0,
				Math.min(10000, Math.round((element.scrollTop / range) * 10000)),
			);
			if (!finished && pending >= READ_AT_END_PROGRESS) {
				finish();
				return;
			}
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
	}, [client, data.article.id, data.article.isRead]);
	return (
		<div ref={scroll} className="min-h-0 flex-1 overflow-y-auto">
			<div aria-hidden="true" className="sticky top-0 z-10 h-0.5">
				<div
					className="h-full bg-mark transition-[width] duration-150"
					style={{ width: `${Math.min(100, Math.max(0, readPercent))}%` }}
				/>
			</div>
			<article
				className={cn(
					"mx-auto w-full px-5 pt-9 pb-16 sm:px-8",
					settings.font === "serif" ? "font-serif" : "font-sans",
				)}
				style={{
					maxWidth: `calc(${READER_MEASURES[settings.width]} + 4rem)`,
					fontSize: `${settings.fontSize}px`,
				}}
			>
				<header className="mb-8 space-y-3">
					<ArticleReaderMetadata payload={data} />
					<h1 className="text-[2em] leading-[1.12] font-semibold tracking-[-0.01em] text-balance">
						{shown.title ?? data.article.url}
					</h1>
				</header>
				{data.content.status === "ready" ? (
					<ArticleReaderContent markdown={shown.markdown} />
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
