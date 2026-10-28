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
			className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground"
		>
			{(
				[
					["unread", stats.unread],
					["on the shelf", stats.total],
					["read this week", stats.readThisWeek],
					["saved this week", stats.savedThisWeek],
				] as const
			).map(([label, value]) => (
				<div key={label} className="flex items-baseline gap-1.5">
					<dt>{label}</dt>
					<dd className="order-first font-bold tabular-nums text-foreground">
						{value}
					</dd>
				</div>
			))}
		</dl>
	);
}
