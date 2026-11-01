import { isThemeMode, THEME_OPTIONS } from "#/components/theme/helpers";
import { useThemeMode } from "#/components/theme/use-theme-mode";
import { ToggleGroup, ToggleGroupItem } from "#/components/ui/toggle-group";

/** Labeled Light / Dark / System choice for Settings. */
export function ThemeChoice() {
	const { mode, setMode } = useThemeMode();

	return (
		<ToggleGroup
			type="single"
			value={mode}
			onValueChange={(value) => {
				if (isThemeMode(value)) setMode(value);
			}}
			aria-label="Theme"
			className="grid w-full grid-cols-3 sm:inline-flex sm:w-auto"
		>
			{THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
				<ToggleGroupItem
					key={value}
					value={value}
					className="min-w-0 gap-1.5 pointer-coarse:h-10"
				>
					<Icon className="size-4" />
					{label}
				</ToggleGroupItem>
			))}
		</ToggleGroup>
	);
}
