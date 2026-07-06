import { Check, Copy, KeyRound, RotateCw, Trash2 } from "lucide-react";
import { useApiTokenCard } from "#/components/settings/use-api-token-card";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { formatFullDate } from "#/lib/formatters";

export function ApiTokenCard() {
	const {
		apiToken,
		newToken,
		loading,
		copying,
		error,
		handleGenerate,
		handleRevoke,
		handleCopy,
	} = useApiTokenCard();

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<KeyRound className="size-5" />
					API access
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="rounded-lg border bg-muted/30 px-3 py-3">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div className="min-w-0 space-y-1">
							<p className="text-sm font-medium">
								{apiToken ? "Personal token enabled" : "No personal token"}
							</p>
							<p className="text-sm text-muted-foreground">
								{apiToken
									? `Token starts with ${apiToken.tokenPrefix}`
									: "Generate one token for REST API clients."}
							</p>
						</div>
						<div className="flex shrink-0 flex-wrap gap-2">
							<Button
								type="button"
								variant={apiToken ? "outline" : "default"}
								disabled={loading}
								onClick={() => void handleGenerate()}
							>
								<RotateCw className="size-4" />
								{apiToken ? "Regenerate" : "Generate token"}
							</Button>
							{apiToken ? (
								<Button
									type="button"
									variant="outline"
									disabled={loading}
									onClick={() => void handleRevoke()}
								>
									<Trash2 className="size-4" />
									Revoke
								</Button>
							) : null}
						</div>
					</div>
				</div>

				{newToken ? (
					<div className="space-y-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-3">
						<div className="flex items-center gap-2 text-sm font-medium">
							<Check className="size-4 text-primary" />
							Copy this token now
						</div>
						<div className="flex gap-2">
							<Input
								value={newToken}
								readOnly
								className="font-mono text-xs"
								aria-label="New API token"
							/>
							<Button
								type="button"
								variant="outline"
								disabled={copying}
								onClick={() => void handleCopy()}
								aria-label="Copy API token"
							>
								<Copy className="size-4" />
							</Button>
						</div>
						<p className="text-sm text-muted-foreground">
							Hold Shelf stores only a hash and cannot show this token again.
						</p>
					</div>
				) : null}

				{apiToken ? (
					<p className="text-xs text-muted-foreground">
						Created {formatFullDate(apiToken.createdAt)}
						{apiToken.lastUsedAt
							? ` · Last used ${formatFullDate(apiToken.lastUsedAt)}`
							: ""}
					</p>
				) : null}

				{error ? <p className="text-sm text-destructive">{error}</p> : null}
			</CardContent>
		</Card>
	);
}
