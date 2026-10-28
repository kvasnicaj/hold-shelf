import { READER_FONT_SIZE_RANGE } from "#/components/article-reader/helpers";
import { ReaderSettingRow } from "#/components/article-reader/reader-setting-row";
import type {
	ReaderFont,
	ReaderSettings,
	ReaderWidth,
} from "#/components/article-reader/types";
import { Button } from "#/components/ui/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "#/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "#/components/ui/toggle-group";

type ReaderPreferencesProps = {
	settings: ReaderSettings;
	onChange: (partial: Partial<ReaderSettings>) => void;
};

export function ReaderPreferences({
	settings,
	onChange,
}: ReaderPreferencesProps) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="icon-sm"
					aria-label="Reading settings"
					title="Reading settings"
					className="font-serif text-base"
				>
					Aa
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" className="w-64 space-y-4 p-3">
				<ReaderSettingRow label="Text size">
					<div className="flex items-center justify-between">
						<Button
							variant="outline"
							size="icon-sm"
							aria-label="Smaller text"
							className="font-serif text-xs"
							disabled={settings.fontSize <= READER_FONT_SIZE_RANGE.min}
							onClick={() => onChange({ fontSize: settings.fontSize - 1 })}
						>
							A
						</Button>
						<span className="text-sm font-semibold tabular-nums">
							{settings.fontSize} px
						</span>
						<Button
							variant="outline"
							size="icon-sm"
							aria-label="Larger text"
							className="font-serif text-lg"
							disabled={settings.fontSize >= READER_FONT_SIZE_RANGE.max}
							onClick={() => onChange({ fontSize: settings.fontSize + 1 })}
						>
							A
						</Button>
					</div>
				</ReaderSettingRow>
				<ReaderSettingRow label="Line width">
					<ToggleGroup
						type="single"
						value={settings.width}
						onValueChange={(value) => {
							if (value) onChange({ width: value as ReaderWidth });
						}}
						aria-label="Line width"
						className="grid w-full grid-cols-3"
					>
						<ToggleGroupItem value="narrow" className="min-w-0">
							Narrow
						</ToggleGroupItem>
						<ToggleGroupItem value="normal" className="min-w-0">
							Normal
						</ToggleGroupItem>
						<ToggleGroupItem value="wide" className="min-w-0">
							Wide
						</ToggleGroupItem>
					</ToggleGroup>
				</ReaderSettingRow>
				<ReaderSettingRow label="Font">
					<ToggleGroup
						type="single"
						value={settings.font}
						onValueChange={(value) => {
							if (value) onChange({ font: value as ReaderFont });
						}}
						aria-label="Font"
						className="grid w-full grid-cols-2"
					>
						<ToggleGroupItem value="serif" className="min-w-0 font-serif">
							Serif
						</ToggleGroupItem>
						<ToggleGroupItem value="sans" className="min-w-0 font-sans">
							Sans
						</ToggleGroupItem>
					</ToggleGroup>
				</ReaderSettingRow>
			</PopoverContent>
		</Popover>
	);
}
