import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "#/components/brand/brand-logo";
import { CookiePreferencesButton } from "#/components/privacy/cookie-preferences-button";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";

export function PrivacyPage() {
	return (
		<div className="relative min-h-svh overflow-hidden bg-background px-6 py-10">
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--lagoon)/0.08,transparent_65%)]" />

			<div className="relative mx-auto flex max-w-3xl flex-col gap-6">
				<div className="flex items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<div className="flex size-12 items-center justify-center rounded-2xl bg-(--lagoon)/10 ring-1 ring-(--lagoon)/20">
							<BrandLogo variant="symbol" className="size-6" decorative />
						</div>
						<div>
							<p className="display-title text-2xl font-bold text-(--sea-ink)">
								Privacy Policy
							</p>
							<p className="text-sm text-(--sea-ink-soft)">
								How Hold Shelf and the Chrome extension handle data
							</p>
						</div>
					</div>

					<Button asChild variant="outline">
						<Link to="/">
							<ArrowLeft className="size-4" />
							Back home
						</Link>
					</Button>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>What Hold Shelf collects</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
						<p>
							Hold Shelf processes account information and saved content to
							provide the save-for-later service. Optional browser diagnostics
							are described separately below.
						</p>
						<p>
							When you save a page or link, Hold Shelf stores the selected URL
							in your account. Hold Shelf may also retrieve metadata for that
							URL, such as the page title, description, favicon, and hostname,
							so the saved item can be displayed clearly in your library.
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Cookies and local storage</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
						<p>
							Essential sign-in and security cookies keep you authenticated and
							protect the GitHub sign-in flow. These include
							<code> __Secure-better-auth.session_token</code> and temporary
							state cookies. They expire with the session or sign-in flow.
							Cloudflare may also set security cookies when its protections are
							used.
						</p>
						<p>
							The <code>cc_cookie</code> cookie stores your consent choice for
							182 days. You can reject optional monitoring and still sign in and
							use Hold Shelf. We ask again when this choice expires or the
							consent policy changes.
						</p>
						<p>
							Interface settings are remembered on your device: the
							<code> sidebar_state</code> cookie lasts seven days when used;
							<code> theme</code> and <code>reader-preferences</code> are stored
							in localStorage until you clear them. These preferences are not
							used for advertising. Fonts are served by Hold Shelf, not Google
							Fonts.
						</p>
						<CookiePreferencesButton />
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Optional browser diagnostics</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
						<p>
							Only after you accept optional monitoring do we load Sentry in
							your browser. It sends error reports and sampled performance
							diagnostics to help us find problems. Reports can contain
							technical browser and device information, stack locations, and
							timing data. Requests to Sentry also expose your IP address to the
							provider. We filter private content, credentials, and URL
							parameters from diagnostic reports; we do not claim these reports
							are anonymous.
						</p>
						<p>
							We do not enable session replay or advertising analytics. You can
							withdraw browser-monitoring consent using Cookie preferences on
							this page, the home page, sign-in page, or your account menu.
							Withdrawing consent reloads the page to remove browser monitoring
							without signing you out. It stops future reporting, but does not
							delete reports already sent. Learn more about the provider in
							Sentry&apos;s{" "}
							<a className="underline" href="https://sentry.io/privacy/">
								privacy policy
							</a>
							.
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Hosting and operational diagnostics</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
						<p>
							Cloudflare hosts Hold Shelf and processes requests to deliver and
							protect the service. Server-side Sentry diagnostics help us
							operate the service independently of optional browser monitoring.
							The browser-monitoring choice does not disable server-side error
							reporting or security controls. We filter sensitive content from
							server diagnostic reports as well.
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>How the Chrome extension works</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
						<p>
							The Hold Shelf Chrome extension saves only the page or link that
							you explicitly choose to save. It does not automatically collect
							your browsing history, monitor pages in the background, or record
							clicks, scrolling, or keystrokes.
						</p>
						<p>
							The extension uses the current tab URL or selected link URL only
							when you click the extension button or use the save action from
							the browser context menu.
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Permissions used by the extension</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
						<p>
							<strong className="text-foreground">activeTab</strong>: used to
							read the current page URL when you click the extension button.
						</p>
						<p>
							<strong className="text-foreground">contextMenus</strong>: used to
							add save actions for pages and links in Chrome&apos;s right-click
							menu.
						</p>
						<p>
							<strong className="text-foreground">scripting</strong>: used to
							show lightweight in-page success and error feedback after a save
							action.
						</p>
						<p>
							<strong className="text-foreground">
								https://hold-shelf.com/*
							</strong>
							: used only to call the Hold Shelf save API and open the website
							login handoff flow when you are not signed in.
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>How information is used</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
						<p>
							Information is used only to provide and improve Hold Shelf. Saved
							URLs and related metadata are used to organize your reading list
							and display saved items inside your account.
						</p>
						<p>Hold Shelf does not sell user data.</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Shared tag links</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
						<p>
							If you explicitly create a sharing link for a tag, anyone with
							that link can see your first name, the shared tag name, and the
							current article links and metadata inside that tag.
						</p>
						<p>
							Other tags, account details, reading status, favorites, and saved
							article content are not included. You can stop sharing at any
							time, which invalidates the existing link.
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
