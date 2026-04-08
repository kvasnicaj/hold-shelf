import { getRouteApi, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { AccountSummaryCard } from "#/components/settings/account-summary-card";
import { DeleteAccountCard } from "#/components/settings/delete-account-card";
import { ReadingSettingsCard } from "#/components/settings/reading-settings-card";
import ThemeToggle from "#/components/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { updateUserSettings } from "#/server/user-settings";

const appRoute = getRouteApi("/app");

export function SettingsPage() {
	const { settings } = appRoute.useLoaderData();
	const router = useRouter();
	const [pendingValue, setPendingValue] = useState<boolean | null>(null);
	const isPending = pendingValue !== null;
	const markReadOnOpen = pendingValue ?? settings.markReadOnOpen;

	async function handleMarkReadOnOpenChange(nextValue: boolean) {
		setPendingValue(nextValue);

		try {
			await updateUserSettings({ data: { markReadOnOpen: nextValue } });
			await router.invalidate();
		} finally {
			setPendingValue(null);
		}
	}

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

				<ReadingSettingsCard
					checked={markReadOnOpen}
					disabled={isPending}
					onCheckedChange={handleMarkReadOnOpenChange}
				/>

				<AccountSummaryCard />
				<DeleteAccountCard />
			</div>
		</div>
	);
}
