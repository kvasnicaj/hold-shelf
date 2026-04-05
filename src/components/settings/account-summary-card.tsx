import { Github } from "lucide-react";
import { getAccountInitials } from "#/components/settings/helpers";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { authClient } from "#/lib/auth-client";

export function AccountSummaryCard() {
	const { data: session } = authClient.useSession();
	const user = session?.user;

	return (
		<Card>
			<CardHeader>
				<CardTitle>Account</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center gap-3">
					{user?.image ? (
						<img
							src={user.image}
							alt={user.name ?? user.email ?? "GitHub profile"}
							className="h-12 w-12 rounded-full border object-cover"
						/>
					) : (
						<div className="flex h-12 w-12 items-center justify-center rounded-full border bg-muted font-medium text-muted-foreground">
							{getAccountInitials(user?.name, user?.email)}
						</div>
					)}
					<div className="min-w-0">
						<p className="font-medium">{user?.name ?? "GitHub account"}</p>
						<p className="truncate text-sm text-muted-foreground">
							{user?.email ?? "Signed in with GitHub"}
						</p>
					</div>
				</div>

				<div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
					<div>
						<p className="text-sm font-medium">Provider</p>
						<p className="text-sm text-muted-foreground">
							GitHub is the only sign-in method for this account.
						</p>
					</div>
					<div className="flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium">
						<Github className="h-4 w-4" />
						GitHub
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
