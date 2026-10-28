import type { ReactNode } from "react";

type PublicSectionProps = {
	title: string;
	children: ReactNode;
};

export function PublicSection({ title, children }: PublicSectionProps) {
	return (
		<section className="space-y-3 border-t pt-8">
			<h2 className="font-serif text-xl font-semibold">{title}</h2>
			<div className="space-y-4 text-[15px] leading-7 text-muted-foreground">
				{children}
			</div>
		</section>
	);
}
