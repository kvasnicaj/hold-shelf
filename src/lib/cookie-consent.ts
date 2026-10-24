import * as CookieConsent from "vanilla-cookieconsent";

const CONSENT_REVISION = 1;
let startup: Promise<void> | undefined;
let monitoringAllowed = false;
let monitoringStarted = false;
let monitoringModule: Promise<typeof import("#/lib/sentry")> | undefined;

/** Read the persisted choice too: another tab can withdraw consent or it can expire. */
export function hasMonitoringConsent(): boolean {
	if (!monitoringAllowed || !CookieConsent.validConsent()) return false;
	try {
		const cookie = CookieConsent.getCookie();
		return (
			cookie.revision === CONSENT_REVISION &&
			Array.isArray(cookie.categories) &&
			cookie.categories.includes("monitoring")
		);
	} catch {
		return false;
	}
}

function syncMonitoringConsent() {
	monitoringAllowed = CookieConsent.acceptedCategory("monitoring");
	if (!hasMonitoringConsent()) {
		// A reload removes SDK instrumentation and in-memory diagnostic state.
		// The transport guard blocks new sends immediately, before the reload.
		if (monitoringStarted) window.location.reload();
		return;
	}
	monitoringModule ??= import("#/lib/sentry");
	void monitoringModule
		.then(({ initSentry }) => {
			// Consent may have been withdrawn while the SDK was downloading.
			if (!hasMonitoringConsent() || monitoringStarted) return;
			monitoringStarted = true;
			initSentry(hasMonitoringConsent);
		})
		.catch(() => {
			// Monitoring is optional; a blocked SDK must not break the app.
			monitoringModule = undefined;
		});
}

export function startCookieConsent(): Promise<void> {
	if (typeof window === "undefined") return Promise.resolve();
	startup ??= CookieConsent.run({
		mode: "opt-in",
		revision: CONSENT_REVISION,
		hideFromBots: false,
		manageScriptTags: false,
		cookie: {
			name: "cc_cookie",
			domain: "",
			path: "/",
			secure: true,
			sameSite: "Lax",
			expiresAfterDays: 182,
		},
		guiOptions: {
			consentModal: {
				layout: "box inline",
				position: "bottom left",
				equalWeightButtons: true,
			},
			preferencesModal: { layout: "box", equalWeightButtons: true },
		},
		onConsent: syncMonitoringConsent,
		onChange: syncMonitoringConsent,
		categories: {
			necessary: { enabled: true, readOnly: true },
			monitoring: { enabled: false },
		},
		language: {
			default: "en",
			translations: {
				en: {
					consentModal: {
						title: "Your privacy choices",
						description:
							"We use essential cookies to keep you signed in and remember your choices. With your permission, Sentry helps us diagnose browser errors and performance. Optional monitoring is off until you accept it. You can use Hold Shelf either way.",
						acceptAllBtn: "Accept all",
						acceptNecessaryBtn: "Reject optional",
						showPreferencesBtn: "Manage preferences",
						footer: '<a href="/privacy">Privacy policy</a>',
					},
					preferencesModal: {
						title: "Cookie preferences",
						acceptAllBtn: "Accept all",
						acceptNecessaryBtn: "Reject optional",
						savePreferencesBtn: "Save preferences",
						closeIconLabel: "Close preferences",
						sections: [
							{
								title: "Essential storage",
								description:
									"Sign-in and security cookies make your account work. The cc_cookie cookie remembers your consent choice for 182 days. We also remember interface choices such as your theme, sidebar, and reader settings using cookies or localStorage. These are not used for advertising.",
								linkedCategory: "necessary",
							},
							{
								title: "Optional browser monitoring (Sentry)",
								description:
									"Sentry receives browser error reports and sampled performance diagnostics only if you opt in. Reports can include technical browser and device information; network requests expose your IP address to the provider. We filter private content, credentials, and URL parameters. We do not enable session replay or advertising analytics. Turning this off reloads the page to stop browser monitoring; it does not delete reports already sent. Server-side operational monitoring is separate. See our privacy policy for details.",
								linkedCategory: "monitoring",
							},
							{
								title: "Change your mind anytime",
								description:
									'Use “Cookie preferences” on the home page, in your account menu, or on the <a href="/privacy">privacy policy</a> to update your choice. Rejecting optional monitoring does not sign you out.',
							},
						],
					},
				},
			},
		},
	}).then(() => {
		// CookieConsent keeps its UI state in memory; reload on focus if another
		// tab changed/deleted the cookie, so both the UI and SDK use the new choice.
		let savedChoice = JSON.stringify(CookieConsent.getCookie());
		const refreshChoice = () => {
			const currentChoice = JSON.stringify(CookieConsent.getCookie());
			if (currentChoice !== savedChoice) window.location.reload();
		};
		window.addEventListener("focus", refreshChoice);
		window.addEventListener("cc:onConsent", () => {
			savedChoice = JSON.stringify(CookieConsent.getCookie());
		});
		window.addEventListener("cc:onChange", () => {
			savedChoice = JSON.stringify(CookieConsent.getCookie());
		});
	});
	return startup;
}

export async function showCookiePreferences() {
	await startCookieConsent();
	CookieConsent.showPreferences();
}
