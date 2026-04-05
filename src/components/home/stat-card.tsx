import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";

type StatCardProps = {
	title: string;
	value: number;
	subtitle: string;
	icon: React.ComponentType<{ className?: string }>;
};

export function StatCard({
	title,
	value,
	subtitle,
	icon: Icon,
}: StatCardProps) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle className="text-sm font-medium">{title}</CardTitle>
				<Icon className="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<p className="text-2xl font-bold">{value}</p>
				<p className="text-xs text-muted-foreground">{subtitle}</p>
			</CardContent>
		</Card>
	);
}
