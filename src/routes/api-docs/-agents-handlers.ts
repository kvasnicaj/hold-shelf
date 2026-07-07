import {
	API_DOCS_AGENT_EXPORT_FILENAME,
	API_DOCS_AGENT_MARKDOWN,
} from "#/components/api-docs/helpers";

export function handleApiDocsAgentGet() {
	return new Response(API_DOCS_AGENT_MARKDOWN, {
		headers: {
			"Cache-Control": "public, max-age=300",
			"Content-Disposition": `attachment; filename="${API_DOCS_AGENT_EXPORT_FILENAME}"`,
			"Content-Type": "text/markdown; charset=utf-8",
		},
	});
}
