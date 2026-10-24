import { showCookiePreferences } from "#/lib/cookie-consent";

export function CookiePreferencesButton() {
	return (
		<button
			type="button"
			className="cursor-pointer text-sm underline underline-offset-4 hover:text-foreground"
			onClick={() => void showCookiePreferences()}
		>
			Cookie preferences
		</button>
	);
}
