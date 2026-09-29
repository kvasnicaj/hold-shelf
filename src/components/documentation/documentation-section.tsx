import type { ReactNode } from "react";

type DocumentationSectionProps = {
	title: string;
	description?: string;
	children: ReactNode;
};

export function DocumentationSection({
	title,
	description,
	children,
}: DocumentationSectionProps) {
	return (
		<section className="min-w-0 space-y-4">
			<div className="space-y-1">
				<h2 className="display-title text-2xl font-semibold text-(--sea-ink)">
					{title}
				</h2>
				{description ? (
					<p className="text-sm text-muted-foreground">{description}</p>
				) : null}
			</div>
			{children}
		</section>
	);
}
