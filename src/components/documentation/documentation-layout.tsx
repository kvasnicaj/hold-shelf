import { ArrowLeft, BookOpen, Terminal } from "lucide-react";
import type { ReactNode } from "react";
import { PublicPageHeading } from "#/components/public/public-page-heading";
import { PublicPageLayout } from "#/components/public/public-page-layout";
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
	return (
		<PublicPageLayout
			width="wide"
			actions={
				<Button asChild variant="ghost">
					<a href="/app/settings" className="text-foreground no-underline">
						<ArrowLeft />
						Settings
					</a>
				</Button>
			}
		>
			<div className="flex min-w-0 flex-col gap-10">
				<div className="space-y-6">
					<PublicPageHeading
						eyebrow="Personal access tokens"
						title={title}
						description={description}
					/>
					<div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
						<nav aria-label="Documentation" className="flex gap-1">
							<Button asChild variant={kind === "api" ? "secondary" : "ghost"}>
								<a
									href="/api-docs"
									aria-current={kind === "api" ? "page" : undefined}
									className="text-foreground no-underline"
								>
									<BookOpen /> REST API
								</a>
							</Button>
							<Button asChild variant={kind === "cli" ? "secondary" : "ghost"}>
								<a
									href="/cli-docs"
									aria-current={kind === "cli" ? "page" : undefined}
									className="text-foreground no-underline"
								>
									<Terminal /> CLI
								</a>
							</Button>
						</nav>
						{actions}
					</div>
				</div>
				{children}
			</div>
		</PublicPageLayout>
	);
}
