import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";

type ArticlesHeaderProps = {
	title: string;
	total: number;
	sort?: "newest" | "oldest" | "title";
	onSortChange: (sort: "newest" | "oldest" | "title") => void;
	emptyStateMessage: string;
	emptyStateHint?: string;
};

export function ArticlesHeader({
	title,
	total,
	sort,
	onSortChange,
	emptyStateMessage,
	emptyStateHint,
}: ArticlesHeaderProps) {
	return (
		<>
			<h1 className="display-title text-2xl font-bold">{title}</h1>

			<div className="flex items-center gap-2">
				<p className="text-sm text-muted-foreground">
					{total} article{total !== 1 ? "s" : ""}
				</p>
				<div className="ml-auto">
					<Select
						value={sort ?? "newest"}
						onValueChange={(value) =>
							onSortChange(value as "newest" | "oldest" | "title")
						}
					>
						<SelectTrigger aria-label="Sort articles" className="min-w-40">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="newest">Newest first</SelectItem>
							<SelectItem value="oldest">Oldest first</SelectItem>
							<SelectItem value="title">Title A-Z</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{total === 0 && (
				<div className="flex flex-col items-center justify-center py-20 text-center">
					<p className="text-lg text-muted-foreground">{emptyStateMessage}</p>
					{emptyStateHint && (
						<p className="mt-1 text-sm text-muted-foreground">
							{emptyStateHint}
						</p>
					)}
				</div>
			)}
		</>
	);
}
