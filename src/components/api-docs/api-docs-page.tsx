import { Download } from "lucide-react";
import { ApiDocsEndpointCard } from "#/components/api-docs/api-docs-endpoint-card";
import {
	API_DOCS_AGENT_EXPORT_FILENAME,
	API_DOCS_AGENT_EXPORT_PATH,
	API_DOCS_SECTIONS,
} from "#/components/api-docs/helpers";
import { DocumentationLayout } from "#/components/documentation/documentation-layout";
import { DocumentationSection } from "#/components/documentation/documentation-section";
import { Button } from "#/components/ui/button";

export function ApiDocsPage() {
	return (
		<DocumentationLayout
			kind="api"
			title="REST API documentation"
			description="Browse, search, read, save, and organize your library from the Hold Shelf CLI, scripts, automation, and trusted clients."
			actions={
				<Button asChild variant="outline">
					<a
						href={API_DOCS_AGENT_EXPORT_PATH}
						download={API_DOCS_AGENT_EXPORT_FILENAME}
					>
						<Download className="size-4" />
						Export agent docs
					</a>
				</Button>
			}
		>
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
						Create, regenerate, or revoke your one active token in Settings.
					</p>
				</div>
			</section>

			{API_DOCS_SECTIONS.map((section) => (
				<DocumentationSection
					key={section.title}
					title={section.title}
					description={section.description}
				>
					<div className="space-y-4">
						{section.endpoints.map((endpoint) => (
							<ApiDocsEndpointCard
								key={`${endpoint.method}-${endpoint.path}`}
								endpoint={endpoint}
							/>
						))}
					</div>
				</DocumentationSection>
			))}
		</DocumentationLayout>
	);
}
