import { Terminal } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";

export function CliCard() {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Terminal className="size-5" />
					Command-line access
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<p className="text-sm text-muted-foreground">
					Save links, search your library, and read articles from your terminal.
					Install the CLI from our public GitHub repository, then connect it to
					your account with an API token. The guide covers setup and usage.
				</p>
				<Button asChild variant="outline">
					<a href="/cli-docs">Read CLI documentation</a>
				</Button>
			</CardContent>
		</Card>
	);
}
