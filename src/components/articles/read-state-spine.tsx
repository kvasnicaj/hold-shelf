import { cn } from "#/lib/utils";

type ReadStateSpineProps = {
	isRead: boolean;
	className?: string;
};

export function ReadStateSpine({ isRead, className }: ReadStateSpineProps) {
	const label = isRead ? "Read" : "Unread";

	return (
		<span
			role="img"
			aria-label={label}
			title={label}
			className={cn(
				"block h-3.5 w-[3px] shrink-0 rounded-[1px]",
				isRead ? "bg-transparent" : "bg-mark",
				className,
			)}
		/>
	);
}
