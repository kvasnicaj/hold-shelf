type HomeStatsSectionProps = {
	stats: {
		unread: number;
		total: number;
		readThisWeek: number;
		savedThisWeek: number;
	};
};
export function HomeStatsSection({ stats }: HomeStatsSectionProps) {
	return (
		<dl
			aria-label="Reading stats"
			className="grid grid-cols-2 gap-4 rounded-xl border bg-muted/20 p-4 sm:grid-cols-4"
		>
			{[
				["Unread", stats.unread],
				["Total", stats.total],
				["Read this week", stats.readThisWeek],
				["Saved this week", stats.savedThisWeek],
			].map(([label, value]) => (
				<div key={label}>
					<dt className="text-xs text-muted-foreground">{label}</dt>
					<dd className="mt-1 text-xl font-semibold tabular-nums">{value}</dd>
				</div>
			))}
		</dl>
	);
}
