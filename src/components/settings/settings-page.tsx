import { Globe } from "@phosphor-icons/react";
import { AddToChromeButton } from "#/components/extension/add-to-chrome-button";
import { PageHeading } from "#/components/layout/page-heading";
import { LibraryBackupCard } from "#/components/library/library-backup-card";
import { AccountSummaryCard } from "#/components/settings/account-summary-card";
import { ApiTokenCard } from "#/components/settings/api-token-card";
import { CliCard } from "#/components/settings/cli-card";
import { DeleteAccountCard } from "#/components/settings/delete-account-card";
import { ThemeChoice } from "#/components/theme/theme-choice";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";

export function SettingsPage() {
	return (
		<div className="w-full max-w-3xl space-y-6">
			<PageHeading
				title="Settings"
				description="Appearance, account access and integrations."
			/>

			<Card>
				<CardHeader>
					<CardTitle>Appearance</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<span className="text-sm">Theme</span>
					<ThemeChoice />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Browser extension</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-start gap-3">
						<div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
							<Globe className="size-5 text-muted-foreground" />
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

			<LibraryBackupCard />
			<AccountSummaryCard />
			<ApiTokenCard />
			<CliCard />
			<DeleteAccountCard />
		</div>
	);
}
