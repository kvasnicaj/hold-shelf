import { AccountSummaryCard } from "#/components/settings/account-summary-card";
import ThemeToggle from "#/components/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";

export function SettingsPage() {
	return (
		<div className="mx-auto max-w-5xl space-y-4">
			<h1 className="display-title text-2xl font-bold">Settings</h1>
			<div className="max-w-2xl space-y-4">
				<Card>
					<CardHeader>
						<CardTitle>Appearance</CardTitle>
					</CardHeader>
					<CardContent className="flex items-center justify-between">
						<span className="text-sm">Theme</span>
						<ThemeToggle />
					</CardContent>
				</Card>

				<AccountSummaryCard />
			</div>
		</div>
	);
}
