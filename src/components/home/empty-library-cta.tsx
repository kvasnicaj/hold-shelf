import { Card } from "#/components/ui/card";

export function EmptyLibraryCta() {
	return (
		<Card className="p-8 text-center">
			<p className="text-lg font-medium">Your library is empty.</p>
			<p className="mt-2 text-sm text-muted-foreground">
				Use the Add article button in the top bar to save your first article.
			</p>
		</Card>
	);
}
