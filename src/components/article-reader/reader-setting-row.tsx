import type { ReactNode } from "react";

type ReaderSettingRowProps = {
	label: string;
	children: ReactNode;
};

export function ReaderSettingRow({ label, children }: ReaderSettingRowProps) {
	return (
		<div className="space-y-1.5">
			<p className="text-xs font-semibold text-muted-foreground">{label}</p>
			{children}
		</div>
	);
}
