import { isThemeMode, THEME_OPTIONS } from "#/components/theme/helpers";
import { useThemeMode } from "#/components/theme/use-theme-mode";
import {
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
} from "#/components/ui/dropdown-menu";

/** The same Light / Dark / System choice as Settings, inside the account menu. */
export function ThemeMenuItems() {
	const { mode, setMode } = useThemeMode();

	return (
		<>
			<DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
				Theme
			</DropdownMenuLabel>
			<DropdownMenuRadioGroup
				value={mode}
				onValueChange={(value) => {
					if (isThemeMode(value)) setMode(value);
				}}
			>
				{THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
					<DropdownMenuRadioItem
						key={value}
						value={value}
						onSelect={(event) => event.preventDefault()}
					>
						<Icon />
						{label}
					</DropdownMenuRadioItem>
				))}
			</DropdownMenuRadioGroup>
		</>
	);
}
