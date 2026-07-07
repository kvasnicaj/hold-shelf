import { ArrowLeft, BookOpen, KeyRound } from "lucide-react";
import { ApiDocsEndpointCard } from "#/components/api-docs/api-docs-endpoint-card";
import { API_DOCS_SECTIONS } from "#/components/api-docs/helpers";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";

export function ApiDocsPage() {
	return (
		<div className="relative min-h-svh overflow-hidden bg-background px-6 py-10">
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--lagoon)/0.08,transparent_65%)]" />

			<div className="relative mx-auto flex max-w-5xl flex-col gap-8">
				<header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div className="flex items-start gap-3">
						<div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-(--lagoon)/10 ring-1 ring-(--lagoon)/20">
							<BookOpen className="size-6 text-(--lagoon)" />
						</div>
						<div className="space-y-2">
							<Badge variant="outline" className="gap-1">
								<KeyRound className="size-3" />
								Personal tokens
							</Badge>
							<div>
								<h1 className="display-title text-3xl font-bold text-(--sea-ink)">
									API documentation
								</h1>
								<p className="mt-2 max-w-2xl text-sm leading-6 text-(--sea-ink-soft)">
									List your saved articles and save new links from scripts,
									automation, and trusted clients.
								</p>
							</div>
						</div>
					</div>

					<Button asChild variant="outline">
						<a href="/app/settings">
							<ArrowLeft className="size-4" />
							Settings
						</a>
					</Button>
				</header>

				<section className="grid gap-3 rounded-md border bg-card p-4 text-sm text-card-foreground shadow-xs sm:grid-cols-3">
					<div>
						<p className="font-medium">Base URL</p>
						<code className="mt-1 block break-all text-xs text-muted-foreground">
							https://hold-shelf.com
						</code>
					</div>
					<div>
						<p className="font-medium">Token header</p>
						<code className="mt-1 block break-all text-xs text-muted-foreground">
							Authorization: Bearer hs_your_token
						</code>
					</div>
					<div>
						<p className="font-medium">Token management</p>
						<p className="mt-1 text-muted-foreground">
							Create, regenerate, or revoke one token in Settings.
						</p>
					</div>
				</section>

				{API_DOCS_SECTIONS.map((section) => (
					<section key={section.title} className="space-y-4">
						<div className="space-y-1">
							<h2 className="display-title text-2xl font-semibold text-(--sea-ink)">
								{section.title}
							</h2>
							<p className="text-sm text-muted-foreground">
								{section.description}
							</p>
						</div>
						<div className="space-y-4">
							{section.endpoints.map((endpoint) => (
								<ApiDocsEndpointCard
									key={`${endpoint.method}-${endpoint.path}`}
									endpoint={endpoint}
								/>
							))}
						</div>
					</section>
				))}
			</div>
		</div>
	);
}
