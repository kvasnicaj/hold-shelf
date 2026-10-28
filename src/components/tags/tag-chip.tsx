import type { ReactNode } from "react";
import { getTagChipClassName } from "#/components/tags/helpers";

type TagChipProps = {
	isActive: boolean;
	onClick: () => void;
	children: ReactNode;
	count?: number;
};

export function TagChip({ isActive, onClick, children, count }: TagChipProps) {
	return (
		<button
			type="button"
			aria-pressed={isActive}
			className={getTagChipClassName(isActive)}
			onClick={onClick}
		>
			{children}
			{count !== undefined && (
				<span className="font-medium tabular-nums opacity-70">{count}</span>
			)}
		</button>
	);
}
