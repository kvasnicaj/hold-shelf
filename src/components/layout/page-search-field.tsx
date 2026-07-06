import { Search } from "lucide-react";
import { Input } from "#/components/ui/input";

type PageSearchFieldProps = {
	value: string;
	placeholder: string;
	ariaLabel: string;
	onSearch: (query: string) => void;
	className?: string;
};

export function PageSearchField({
	value,
	placeholder,
	ariaLabel,
	onSearch,
	className,
}: PageSearchFieldProps) {
	return (
		<div className={className}>
			<div className="relative">
				<Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					type="search"
					value={value}
					onChange={(event) => onSearch(event.target.value)}
					placeholder={placeholder}
					aria-label={ariaLabel}
					className="bg-muted/35 pl-9 shadow-none"
				/>
			</div>
		</div>
	);
}
