import { Archive, BookOpen, Plus, TrendingUp } from "lucide-react";
import { StatCard } from "#/components/home/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";

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
		<>
			<Card className="md:hidden">
				<CardHeader>
					<CardTitle className="text-base">Reading stats</CardTitle>
				</CardHeader>
				<CardContent className="grid grid-cols-2 gap-3">
					<div className="rounded-md bg-muted/50 p-3">
						<p className="text-xs text-muted-foreground">Unread</p>
						<p className="text-xl font-bold">{stats.unread}</p>
					</div>
					<div className="rounded-md bg-muted/50 p-3">
						<p className="text-xs text-muted-foreground">Total</p>
						<p className="text-xl font-bold">{stats.total}</p>
					</div>
					<div className="rounded-md bg-muted/50 p-3">
						<p className="text-xs text-muted-foreground">Read this week</p>
						<p className="text-xl font-bold">{stats.readThisWeek}</p>
					</div>
					<div className="rounded-md bg-muted/50 p-3">
						<p className="text-xs text-muted-foreground">Saved this week</p>
						<p className="text-xl font-bold">{stats.savedThisWeek}</p>
					</div>
				</CardContent>
			</Card>

			<div className="hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-4">
				<StatCard
					title="Unread"
					value={stats.unread}
					subtitle="to read"
					icon={BookOpen}
				/>
				<StatCard
					title="Total"
					value={stats.total}
					subtitle="saved"
					icon={Archive}
				/>
				<StatCard
					title="Read this week"
					value={stats.readThisWeek}
					subtitle="articles"
					icon={TrendingUp}
				/>
				<StatCard
					title="Saved this week"
					value={stats.savedThisWeek}
					subtitle="articles"
					icon={Plus}
				/>
			</div>
		</>
	);
}
