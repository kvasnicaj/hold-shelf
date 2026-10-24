/* biome-ignore-all lint/suspicious/noDocumentCookie: exercise real persisted cookies in jsdom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { initSentry } = vi.hoisted(() => ({ initSentry: vi.fn() }));
vi.mock("#/lib/sentry", () => ({ initSentry }));

let consent: typeof import("vanilla-cookieconsent");
let app: typeof import("#/lib/cookie-consent");

beforeEach(async () => {
	vi.resetModules();
	consent = await import("vanilla-cookieconsent");
	app = await import("#/lib/cookie-consent");
});

afterEach(() => {
	consent.reset(true);
});

async function settleMonitoring() {
	// Dynamic imports finish after the library's synchronous consent callbacks.
	await vi.dynamicImportSettled();
}

describe("cookie consent with the real CookieConsent library", () => {
	it("starts optional monitoring off and offers equal-weight acceptance and rejection", async () => {
		await app.startCookieConsent();
		expect(document.documentElement).toHaveClass("show--consent");
		expect(app.hasMonitoringConsent()).toBe(false);
		expect(initSentry).not.toHaveBeenCalled();
		expect(
			consent.getConfig("guiOptions")?.consentModal?.equalWeightButtons,
		).toBe(true);
		expect(document.querySelector('[data-role="all"]')).toHaveTextContent(
			"Accept all",
		);
		expect(document.querySelector('[data-role="necessary"]')).toHaveTextContent(
			"Reject optional",
		);
	});

	it("persists rejection, leaves sign-in cookies intact, and can reopen preferences", async () => {
		document.cookie = "session_fixture=kept; path=/";
		await app.startCookieConsent();
		consent.acceptCategory([]);
		await settleMonitoring();
		expect(app.hasMonitoringConsent()).toBe(false);
		expect(initSentry).not.toHaveBeenCalled();
		expect(consent.getCookie().categories).toEqual(["necessary"]);
		expect(document.cookie).toContain("cc_cookie=");
		expect(document.cookie).toContain("session_fixture=kept");
		await app.showCookiePreferences();
		expect(document.documentElement).toHaveClass("show--preferences");
		document.cookie = "session_fixture=; Max-Age=0; path=/";
	});

	it("loads the SDK only after opt-in, once, and its live guard follows the cookie", async () => {
		await app.startCookieConsent();
		consent.acceptCategory("all");
		await settleMonitoring();
		expect(initSentry).toHaveBeenCalledTimes(1);
		expect(app.hasMonitoringConsent()).toBe(true);
		const guard = initSentry.mock.calls[0]?.[0] as () => boolean;
		expect(guard()).toBe(true);
		document.cookie = "cc_cookie=; Max-Age=0; path=/";
		expect(guard()).toBe(false);
	});

	it("does not initialize when acceptance is withdrawn while the SDK is loading", async () => {
		await app.startCookieConsent();
		consent.acceptCategory("all");
		consent.acceptCategory([]);
		await settleMonitoring();
		expect(initSentry).not.toHaveBeenCalled();
		expect(app.hasMonitoringConsent()).toBe(false);
	});

	for (const categories of [["necessary"], ["necessary", "monitoring"]]) {
		it(`respects a returning visitor's ${categories.length === 1 ? "rejection" : "acceptance"}`, async () => {
			await consent.run({
				autoShow: false,
				revision: 1,
				hideFromBots: false,
				cookie: { name: "cc_cookie", domain: "" },
				categories: { necessary: { readOnly: true }, monitoring: {} },
				language: {
					default: "en",
					translations: {
						en: { consentModal: {}, preferencesModal: { sections: [] } },
					},
				},
			});
			consent.acceptCategory(categories);
			consent.reset(false);
			await app.startCookieConsent();
			await settleMonitoring();
			expect(document.documentElement).not.toHaveClass("show--consent");
			expect(initSentry).toHaveBeenCalledTimes(categories.length === 1 ? 0 : 1);
		});
	}

	it("fails closed for a stored choice from an older consent revision", async () => {
		await app.startCookieConsent();
		consent.acceptCategory("all");
		const cookie = { ...consent.getCookie(), revision: 0 };
		document.cookie = `cc_cookie=${encodeURIComponent(JSON.stringify(cookie))}; path=/`;
		expect(app.hasMonitoringConsent()).toBe(false);
		await settleMonitoring();
		expect(initSentry).not.toHaveBeenCalled();
	});
});
