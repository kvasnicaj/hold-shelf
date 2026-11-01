import { HighlightedText } from "#/components/search/highlighted-text";

type SearchResultItemProps = {
	title: string;
	preview: string;
	faviconUrl: string | null;
	query: string;
	onSelect: () => void;
};

export function SearchResultItem({
	title,
	preview,
	faviconUrl,
	query,
	onSelect,
}: SearchResultItemProps) {
	return (
		<button
			type="button"
			className="flex w-full items-start gap-2.5 rounded-md px-3 py-2.5 text-left hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
			onClick={onSelect}
		>
			{faviconUrl && (
				<img
					src={faviconUrl}
					alt=""
					className="mt-0.5 size-4 shrink-0 rounded-[3px]"
					onError={(event) => {
						event.currentTarget.style.display = "none";
					}}
				/>
			)}
			<span className="min-w-0 flex-1">
				<span className="block truncate text-sm font-semibold">
					<HighlightedText text={title} query={query} />
				</span>
				{preview && (
					<span className="mt-0.5 line-clamp-2 text-meta text-muted-foreground">
						<HighlightedText text={preview} query={query} />
					</span>
				)}
			</span>
		</button>
	);
}
