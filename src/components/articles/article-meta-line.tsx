import { TagLabel } from "#/components/tags/tag-label";
import type { Tag } from "#/components/tags/types";
import { cn } from "#/lib/utils";

type ArticleMetaLineProps = {
	hostname: string | null;
	timeAgo: string;
	tags: Tag[];
	className?: string;
};

/** Site, age and tag labels under an article title in comfortable lists. */
export function ArticleMetaLine({
	hostname,
	timeAgo,
	tags,
	className,
}: ArticleMetaLineProps) {
	return (
		<div
			className={cn(
				"flex flex-wrap items-center gap-x-1.5 gap-y-1 text-meta text-muted-foreground",
				className,
			)}
		>
			{hostname && <span className="min-w-0 truncate">{hostname}</span>}
			{timeAgo && (
				<span className="whitespace-nowrap tabular-nums">
					{hostname && <span aria-hidden="true">· </span>}
					{timeAgo}
				</span>
			)}
			{tags.map((tag) => (
				<TagLabel key={tag.id} name={tag.name} className="ml-0.5" />
			))}
		</div>
	);
}
