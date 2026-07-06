import { getRouteApi, useRouter } from "@tanstack/react-router";
import { Globe } from "lucide-react";
import { useState } from "react";
import { AddToChromeButton } from "#/components/extension/add-to-chrome-button";
import { AccountSummaryCard } from "#/components/settings/account-summary-card";
import { ApiTokenCard } from "#/components/settings/api-token-card";
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
		<div className="w-full space-y-4">
			<div className="space-y-1">
				<h1 className="display-title text-2xl font-bold">Settings</h1>
				<p className="text-sm text-muted-foreground">
					Manage reading behavior, account access, and integrations.
				</p>
			</div>
			<div className="grid gap-4 xl:grid-cols-2">
				<div className="space-y-4">
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

					<Card>
						<CardHeader>
							<CardTitle>Browser extension</CardTitle>
						</CardHeader>
						<CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
							<div className="flex items-start gap-3">
								<div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-(--lagoon)/10 ring-1 ring-(--lagoon)/20">
									<Globe className="size-5 text-(--lagoon)" />
								</div>
								<div className="space-y-1">
									<p className="text-sm font-medium">
										Save pages from Chrome in one click
									</p>
									<p className="text-sm text-muted-foreground">
										Install the Hold Shelf extension to save the current tab or
										right-clicked links without leaving your browser.
									</p>
								</div>
							</div>
							<AddToChromeButton />
						</CardContent>
					</Card>
				</div>

				<div className="space-y-4">
					<AccountSummaryCard />
					<ApiTokenCard />
					<DeleteAccountCard />
				</div>
			</div>
		</div>
	);
}
