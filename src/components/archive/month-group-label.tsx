type MonthGroupLabelProps = {
	label: string;
	count: number;
};

export function MonthGroupLabel({ label, count }: MonthGroupLabelProps) {
	return (
		<>
			<span className="font-serif text-sm font-semibold text-foreground">
				{label}
			</span>
			<span className="ml-2 text-xs tabular-nums text-muted-foreground">
				{count}
			</span>
		</>
	);
}
