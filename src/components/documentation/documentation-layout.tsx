import { ArrowLeft, BookOpen, KeyRound, Terminal } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";

type DocumentationLayoutProps = {
	kind: "api" | "cli";
	title: string;
	description: string;
	actions?: ReactNode;
	children: ReactNode;
};

export function DocumentationLayout({
	kind,
	title,
	description,
	actions,
	children,
}: DocumentationLayoutProps) {
	const Icon = kind === "api" ? BookOpen : Terminal;
	return (
		<main className="relative min-h-svh bg-background px-4 py-8 sm:px-6 sm:py-10">
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--lagoon)/0.08,transparent_65%)]" />
			<div className="relative mx-auto flex min-w-0 max-w-5xl flex-col gap-8">
				<header className="space-y-6">
					<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
						<div className="flex min-w-0 items-start gap-3">
							<div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-(--lagoon)/10 ring-1 ring-(--lagoon)/20">
								<Icon className="size-6 text-(--lagoon)" />
							</div>
							<div className="space-y-2">
								<Badge variant="outline" className="gap-1">
									<KeyRound className="size-3" />
									Personal access tokens
								</Badge>
								<h1 className="display-title text-3xl font-bold text-(--sea-ink)">
									{title}
								</h1>
								<p className="max-w-2xl text-sm leading-6 text-(--sea-ink-soft)">
									{description}
								</p>
							</div>
						</div>
						<Button asChild variant="outline" className="self-start">
							<a href="/app/settings">
								<ArrowLeft className="size-4" />
								Settings
							</a>
						</Button>
					</div>
					<div className="flex flex-wrap items-center justify-between gap-3">
						<nav aria-label="Documentation" className="flex gap-2">
							<Button asChild variant={kind === "api" ? "secondary" : "ghost"}>
								<a
									href="/api-docs"
									aria-current={kind === "api" ? "page" : undefined}
								>
									<BookOpen className="size-4" /> REST API
								</a>
							</Button>
							<Button asChild variant={kind === "cli" ? "secondary" : "ghost"}>
								<a
									href="/cli-docs"
									aria-current={kind === "cli" ? "page" : undefined}
								>
									<Terminal className="size-4" /> CLI
								</a>
							</Button>
						</nav>
						{actions}
					</div>
				</header>
				{children}
			</div>
		</main>
	);
}
