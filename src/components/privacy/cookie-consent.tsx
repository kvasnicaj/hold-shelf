import { useEffect } from "react";
import { startCookieConsent } from "#/lib/cookie-consent";

export function CookieConsent() {
	useEffect(() => {
		void startCookieConsent();
	}, []);
	return null;
}
