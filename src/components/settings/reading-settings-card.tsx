import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Label } from "#/components/ui/label";
import { Switch } from "#/components/ui/switch";

type ReadingSettingsCardProps = {
	checked: boolean;
	disabled?: boolean;
	onCheckedChange: (checked: boolean) => void | Promise<void>;
};

export function ReadingSettingsCard({
	checked,
	disabled = false,
	onCheckedChange,
}: ReadingSettingsCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Reading</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="flex items-start justify-between gap-4 rounded-lg border bg-muted/30 px-3 py-3">
					<div className="space-y-1">
						<Label htmlFor="mark-read-on-open">
							Mark articles as read when opened
						</Label>
						<p className="text-sm text-muted-foreground">
							When enabled, opening an article from Hold Shelf marks it as read
							automatically.
						</p>
					</div>
					<Switch
						id="mark-read-on-open"
						checked={checked}
						disabled={disabled}
						className="disabled:cursor-default"
						onCheckedChange={onCheckedChange}
						aria-label="Mark articles as read when opened"
					/>
				</div>
			</CardContent>
		</Card>
	);
}
