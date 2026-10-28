import { cn } from "#/lib/utils";

type ReadingProgressBarProps = {
	/** Progress from 0 to 100. */
	percent: number;
	className?: string;
};

export function ReadingProgressBar({
	percent,
	className,
}: ReadingProgressBarProps) {
	const value = Math.max(0, Math.min(100, Math.round(percent)));

	return (
		<div
			role="progressbar"
			aria-label="Reading progress"
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={value}
			className={cn("h-[3px] overflow-hidden rounded-full bg-muted", className)}
		>
			<div className="h-full bg-mark" style={{ width: `${value}%` }} />
		</div>
	);
}
