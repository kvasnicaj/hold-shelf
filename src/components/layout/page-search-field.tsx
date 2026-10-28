import { MagnifyingGlass } from "@phosphor-icons/react";
import { usePageSearch } from "#/components/layout/use-page-search";
import { Input } from "#/components/ui/input";

type PageSearchFieldProps = {
	value: string;
	placeholder: string;
	ariaLabel: string;
	onSearch: (query: string) => void;
	className?: string;
	debounceMs?: number;
};

export function PageSearchField({
	value,
	placeholder,
	ariaLabel,
	onSearch,
	className,
	debounceMs = 0,
}: PageSearchFieldProps) {
	const { draft, updateDraft, setComposing } = usePageSearch({
		value,
		onSearch,
		delay: debounceMs,
	});
	return (
		<div className={className}>
			<div className="relative">
				<MagnifyingGlass className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					type="search"
					value={draft}
					onChange={(event) => updateDraft(event.target.value)}
					onCompositionStart={() => setComposing(true)}
					onCompositionEnd={() => setComposing(false)}
					placeholder={placeholder}
					aria-label={ariaLabel}
					className="bg-muted/35 pl-9 shadow-none"
				/>
			</div>
		</div>
	);
}
