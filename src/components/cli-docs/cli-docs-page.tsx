import { renderMarkdownToHtml } from "#/components/article-reader/markdown-rendering";
import { CLI_DOCS_SECTIONS } from "#/components/cli-docs/helpers";
import { DocumentationLayout } from "#/components/documentation/documentation-layout";
import { DocumentationSection } from "#/components/documentation/documentation-section";
import { Card, CardContent } from "#/components/ui/card";

export function CliDocsPage() {
	return (
		<DocumentationLayout
			kind="cli"
			title="CLI documentation"
			description="Save, read, and organize your library from the terminal. Connect using a personal access token from Settings."
		>
			{CLI_DOCS_SECTIONS.map((section) => (
				<DocumentationSection key={section.title} title={section.title}>
					<Card>
						<CardContent className="min-w-0">
							<div
								className="prose prose-neutral max-w-none text-sm leading-6 text-card-foreground prose-a:text-primary prose-pre:overflow-x-auto prose-pre:rounded-md prose-pre:border prose-pre:bg-muted/40 prose-pre:p-3 prose-pre:text-xs prose-pre:leading-6 prose-pre:text-foreground dark:prose-invert [&>:first-child]:mt-0 [&>:last-child]:mb-0"
								// biome-ignore lint/security/noDangerouslySetInnerHtml: renderMarkdownToHtml sanitizes the Markdown before serialization.
								dangerouslySetInnerHTML={{
									__html: renderMarkdownToHtml(section.content),
								}}
							/>
						</CardContent>
					</Card>
				</DocumentationSection>
			))}
		</DocumentationLayout>
	);
}
