import { ArrowLeft } from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import { CookiePreferencesButton } from "#/components/privacy/cookie-preferences-button";
import { PublicPageHeading } from "#/components/public/public-page-heading";
import { PublicPageLayout } from "#/components/public/public-page-layout";
import { PublicSection } from "#/components/public/public-section";
import { Button } from "#/components/ui/button";

export function PrivacyPage() {
	return (
		<PublicPageLayout
			actions={
				<Button asChild variant="ghost">
					<Link to="/" className="text-foreground no-underline">
						<ArrowLeft />
						Home
					</Link>
				</Button>
			}
		>
			<div className="space-y-10">
				<PublicPageHeading
					title="Privacy Policy"
					description="How Hold Shelf and the Chrome extension handle data."
				/>
				<PublicSection title="What Hold Shelf collects">
					<p>
						Hold Shelf processes account information and saved content to
						provide the save-for-later service. Optional browser diagnostics are
						described separately below.
					</p>
					<p>
						When you save a page or link, Hold Shelf stores the selected URL in
						your account. Hold Shelf may also retrieve metadata for that URL,
						such as the page title, description, favicon, and hostname, so the
						saved item can be displayed clearly in your library.
					</p>
				</PublicSection>

				<PublicSection title="Cookies and local storage">
					<p>
						Essential sign-in and security cookies keep you authenticated and
						protect the GitHub sign-in flow. These include
						<code> __Secure-better-auth.session_token</code> and temporary state
						cookies. They expire with the session or sign-in flow. Cloudflare
						may also set security cookies when its protections are used.
					</p>
					<p>
						The <code>cc_cookie</code> cookie stores your consent choice for 182
						days. You can reject optional monitoring and still sign in and use
						Hold Shelf. We ask again when this choice expires or the consent
						policy changes.
					</p>
					<p>
						Interface settings are remembered on your device: the
						<code> sidebar_state</code> cookie lasts seven days when used;
						<code> theme</code> and <code>reader-preferences</code> are stored
						in localStorage until you clear them. These preferences are not used
						for advertising. Fonts are served by Hold Shelf, not Google Fonts.
					</p>
					<CookiePreferencesButton />
				</PublicSection>

				<PublicSection title="Optional browser diagnostics">
					<p>
						Only after you accept optional monitoring do we load Sentry in your
						browser. It sends error reports and sampled performance diagnostics
						to help us find problems. Reports can contain technical browser and
						device information, stack locations, and timing data. Requests to
						Sentry also expose your IP address to the provider. We filter
						private content, credentials, and URL parameters from diagnostic
						reports; we do not claim these reports are anonymous.
					</p>
					<p>
						We do not enable session replay or advertising analytics. You can
						withdraw browser-monitoring consent using Cookie preferences on this
						page, the home page, sign-in page, or your account menu. Withdrawing
						consent reloads the page to remove browser monitoring without
						signing you out. It stops future reporting, but does not delete
						reports already sent. Learn more about the provider in Sentry&apos;s{" "}
						<a className="underline" href="https://sentry.io/privacy/">
							privacy policy
						</a>
						.
					</p>
				</PublicSection>

				<PublicSection title="Hosting and operational diagnostics">
					<p>
						Cloudflare hosts Hold Shelf and processes requests to deliver and
						protect the service. Server-side Sentry diagnostics help us operate
						the service independently of optional browser monitoring. The
						browser-monitoring choice does not disable server-side error
						reporting or security controls. We filter sensitive content from
						server diagnostic reports as well.
					</p>
				</PublicSection>

				<PublicSection title="How the Chrome extension works">
					<p>
						The Hold Shelf Chrome extension saves only the page or link that you
						explicitly choose to save. It does not automatically collect your
						browsing history, monitor pages in the background, or record clicks,
						scrolling, or keystrokes.
					</p>
					<p>
						The extension uses the current tab URL or selected link URL only
						when you click the extension button or use the save action from the
						browser context menu.
					</p>
				</PublicSection>

				<PublicSection title="Permissions used by the extension">
					<p>
						<strong className="text-foreground">activeTab</strong>: used to read
						the current page URL when you click the extension button.
					</p>
					<p>
						<strong className="text-foreground">contextMenus</strong>: used to
						add save actions for pages and links in Chrome&apos;s right-click
						menu.
					</p>
					<p>
						<strong className="text-foreground">scripting</strong>: used to show
						lightweight in-page success and error feedback after a save action.
					</p>
					<p>
						<strong className="text-foreground">
							https://hold-shelf.com/*
						</strong>
						: used only to call the Hold Shelf save API and open the website
						login handoff flow when you are not signed in.
					</p>
				</PublicSection>

				<PublicSection title="How information is used">
					<p>
						Information is used only to provide and improve Hold Shelf. Saved
						URLs and related metadata are used to organize your reading list and
						display saved items inside your account.
					</p>
					<p>Hold Shelf does not sell user data.</p>
				</PublicSection>

				<PublicSection title="Shared tag links">
					<p>
						If you explicitly create a sharing link for a tag, anyone with that
						link can see your first name, the shared tag name, and the current
						article links and metadata inside that tag.
					</p>
					<p>
						Other tags, account details, reading status, favorites, and saved
						article content are not included. You can stop sharing at any time,
						which invalidates the existing link.
					</p>
				</PublicSection>
			</div>
		</PublicPageLayout>
	);
}
