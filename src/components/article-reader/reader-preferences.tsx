import { Button } from "#/components/ui/button";

type ReaderPreferencesProps = {
	fontSize: number;
	onChange: (size: number) => void;
};
export function ReaderPreferences({
	fontSize,
	onChange,
}: ReaderPreferencesProps) {
	return (
		<div className="flex flex-wrap items-center justify-center gap-2 border-b bg-muted/20 px-3 py-2 text-xs">
			<span>Text</span>
			<Button
				size="icon-sm"
				variant="ghost"
				aria-label="Smaller text"
				disabled={fontSize <= 14}
				onClick={() => onChange(fontSize - 1)}
			>
				A−
			</Button>
			<Button
				size="icon-sm"
				variant="ghost"
				aria-label="Larger text"
				disabled={fontSize >= 24}
				onClick={() => onChange(fontSize + 1)}
			>
				A+
			</Button>
		</div>
	);
}
