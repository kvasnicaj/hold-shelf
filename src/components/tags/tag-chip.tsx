import type { ReactNode } from "react";
import { getTagChipClassName } from "#/components/tags/helpers";

type TagChipProps = {
	isActive: boolean;
	onClick: () => void;
	children: ReactNode;
	count?: number;
	/** Accessible name when it differs from the visible text. */
	label?: string;
};

export function TagChip({
	isActive,
	onClick,
	children,
	count,
	label,
}: TagChipProps) {
	return (
		<button
			type="button"
			aria-pressed={label ? undefined : isActive}
			aria-label={label}
			className={getTagChipClassName(isActive)}
			onClick={onClick}
		>
			{children}
			{count !== undefined && (
				<span className="text-xs font-medium tabular-nums text-muted-foreground">
					{count}
				</span>
			)}
		</button>
	);
}
