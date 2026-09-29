import { ApiDocsCodeBlock } from "#/components/api-docs/api-docs-code-block";
import { ApiDocsFieldList } from "#/components/api-docs/api-docs-field-list";
import type { ApiEndpoint } from "#/components/api-docs/types";
import { Badge } from "#/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";

type ApiDocsEndpointCardProps = {
	endpoint: ApiEndpoint;
};

export function ApiDocsEndpointCard({ endpoint }: ApiDocsEndpointCardProps) {
	return (
		<Card>
			<CardHeader className="space-y-3">
				<div className="flex flex-wrap items-center gap-2">
					<Badge variant="secondary" className="font-mono">
						{endpoint.method}
					</Badge>
					<code className="break-all rounded-md bg-muted px-2 py-1 text-sm">
						{endpoint.path}
					</code>
				</div>
				<CardTitle className="text-lg">{endpoint.summary}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-5 text-sm">
				<div className="grid gap-3 sm:grid-cols-2">
					<div>
						<p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
							Authentication
						</p>
						<p className="mt-1 break-words font-mono text-xs">
							{endpoint.auth}
						</p>
					</div>
					{endpoint.contentType ? (
						<div>
							<p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
								Content type
							</p>
							<p className="mt-1 font-mono text-xs">{endpoint.contentType}</p>
						</div>
					) : null}
				</div>

				{endpoint.pathParameters ? (
					<ApiDocsFieldList
						title="Path parameters"
						fields={endpoint.pathParameters}
					/>
				) : null}

				{endpoint.parameters ? (
					<ApiDocsFieldList
						title="Query parameters"
						fields={endpoint.parameters}
					/>
				) : null}

				{endpoint.bodyFields ? (
					<ApiDocsFieldList title="JSON body" fields={endpoint.bodyFields} />
				) : null}

				<div className="space-y-3">
					<p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
						Responses
					</p>
					<div className="space-y-3">
						{endpoint.responses.map((response) => (
							<div
								key={`${response.status}-${response.description}`}
								className="space-y-2"
							>
								<div className="flex flex-wrap items-center gap-2">
									<Badge variant="outline" className="font-mono">
										{response.status}
									</Badge>
									<span className="text-muted-foreground">
										{response.description}
									</span>
								</div>
								{response.body ? (
									<pre className="overflow-x-auto rounded-md bg-muted/40 p-3 text-xs leading-6">
										<code>{response.body}</code>
									</pre>
								) : null}
							</div>
						))}
					</div>
				</div>

				<div className="grid gap-4 lg:grid-cols-2">
					<ApiDocsCodeBlock
						label="Example request"
						code={endpoint.exampleRequest}
					/>
					<ApiDocsCodeBlock
						label="Example response"
						code={endpoint.exampleResponse}
					/>
				</div>

				{endpoint.notes ? (
					<ul className="list-disc space-y-1 pl-5 text-muted-foreground">
						{endpoint.notes.map((note) => (
							<li key={note}>{note}</li>
						))}
					</ul>
				) : null}
			</CardContent>
		</Card>
	);
}
