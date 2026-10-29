import { BookmarkSimple } from "@phosphor-icons/react";
import { ReadStateSpine } from "#/components/articles/read-state-spine";
import { cn } from "#/lib/utils";

type ArticleStateMarksProps = {
	isRead: boolean;
	isFavorite: boolean;
	className?: string;
};

/**
 * Fixed-width slot before an article title: the unread spine, then the
 * favorite bookmark. Empty marks keep their space so titles line up.
 */
export function ArticleStateMarks({
	isRead,
	isFavorite,
	className,
}: ArticleStateMarksProps) {
	return (
		<span
			className={cn("inline-flex w-5 shrink-0 items-center gap-1", className)}
		>
			<ReadStateSpine isRead={isRead} />
			{isFavorite ? (
				<BookmarkSimple
					weight="fill"
					role="img"
					aria-label="Favorite"
					className="size-3.5 shrink-0 text-favorite"
				/>
			) : (
				<span aria-hidden="true" className="size-3.5 shrink-0" />
			)}
		</span>
	);
}
