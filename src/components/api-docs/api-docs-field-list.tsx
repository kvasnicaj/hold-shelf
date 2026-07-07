import type { ApiParameter } from "#/components/api-docs/types";

type ApiDocsFieldListProps = {
	title: string;
	fields: ApiParameter[];
};

export function ApiDocsFieldList({ title, fields }: ApiDocsFieldListProps) {
	return (
		<div className="space-y-2">
			<p className="text-xs font-medium uppercase tracking-normal text-muted-foreground">
				{title}
			</p>
			<div className="overflow-hidden rounded-md border">
				<table className="w-full text-left text-sm">
					<thead className="bg-muted/50 text-xs uppercase tracking-normal text-muted-foreground">
						<tr>
							<th scope="col" className="px-3 py-2 font-medium">
								Name
							</th>
							<th
								scope="col"
								className="hidden px-3 py-2 font-medium sm:table-cell"
							>
								Type
							</th>
							<th scope="col" className="px-3 py-2 font-medium">
								Description
							</th>
						</tr>
					</thead>
					<tbody className="divide-y">
						{fields.map((field) => (
							<tr key={field.name}>
								<td className="px-3 py-2 align-top font-mono text-xs">
									{field.name}
									{field.required ? (
										<span className="ml-1 font-sans text-destructive">*</span>
									) : null}
								</td>
								<td className="hidden px-3 py-2 align-top font-mono text-xs text-muted-foreground sm:table-cell">
									{field.type}
								</td>
								<td className="px-3 py-2 align-top text-muted-foreground">
									<span className="block sm:hidden">
										<span className="font-mono text-xs">{field.type}</span>
										<span className="mx-1">-</span>
									</span>
									{field.description}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
