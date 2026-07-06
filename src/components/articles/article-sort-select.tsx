import type { ArticleSort } from "#/components/articles/types";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";

type ArticleSortSelectProps = {
	value?: ArticleSort;
	onChange: (sort: ArticleSort) => void;
	ariaLabel?: string;
	className?: string;
};

export function ArticleSortSelect({
	value,
	onChange,
	ariaLabel = "Sort articles",
	className,
}: ArticleSortSelectProps) {
	return (
		<Select
			value={value ?? "newest"}
			onValueChange={(nextValue) => onChange(nextValue as ArticleSort)}
		>
			<SelectTrigger aria-label={ariaLabel} className={className}>
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="newest">Newest first</SelectItem>
				<SelectItem value="oldest">Oldest first</SelectItem>
				<SelectItem value="title">Title A-Z</SelectItem>
			</SelectContent>
		</Select>
	);
}
