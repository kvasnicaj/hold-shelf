import { NativeSelect } from "#/components/ui/native-select";

type ArticlesHeaderProps = {
	total: number;
	q?: string;
	sort?: "newest" | "oldest" | "title";
	onSortChange: (sort: "newest" | "oldest" | "title") => void;
};

export function ArticlesHeader({
	total,
	q,
	sort,
	onSortChange,
}: ArticlesHeaderProps) {
	return (
		<>
			<h1 className="display-title text-2xl font-bold">Unread</h1>

			<div className="flex items-center gap-2">
				<p className="text-sm text-muted-foreground">
					{total} article{total !== 1 ? "s" : ""}
				</p>
				<div className="ml-auto">
					<NativeSelect
						value={sort ?? "newest"}
						onChange={(event) =>
							onSortChange(event.target.value as "newest" | "oldest" | "title")
						}
					>
						<option value="newest">Newest first</option>
						<option value="oldest">Oldest first</option>
						<option value="title">Title A-Z</option>
					</NativeSelect>
				</div>
			</div>

			{total === 0 && (
				<div className="flex flex-col items-center justify-center py-20 text-center">
					<p className="text-lg text-muted-foreground">
						{q ? "No articles match your search." : "No unread articles yet."}
					</p>
					{!q && (
						<p className="mt-1 text-sm text-muted-foreground">
							Save an article to get started.
						</p>
					)}
				</div>
			)}
		</>
	);
}
