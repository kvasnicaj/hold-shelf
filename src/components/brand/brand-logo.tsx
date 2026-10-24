import artwork from "#/components/brand/artwork.json";
import { cn } from "#/lib/utils";

type BrandLogoProps = {
	variant?: "horizontal" | "stacked" | "symbol" | "wordmark";
	className?: string;
	decorative?: boolean;
	compact?: boolean;
};

export function BrandLogo({
	variant = "horizontal",
	className,
	decorative = false,
	compact = false,
}: BrandLogoProps) {
	const layout = artwork.layouts[variant];

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox={`0 0 ${layout.width} ${layout.height}`}
			width={layout.width}
			height={layout.height}
			role={decorative ? undefined : "img"}
			aria-label={decorative ? undefined : "Hold Shelf"}
			aria-hidden={decorative || undefined}
			focusable="false"
			className={cn(
				"max-w-full shrink-0",
				variant === "symbol"
					? "size-7"
					: variant === "stacked"
						? "h-auto w-72"
						: "h-8 w-auto",
				className,
			)}
		>
			{!decorative && <title>Hold Shelf</title>}
			{variant !== "wordmark" && (
				<g transform={layout.symbolTransform || undefined}>
					<path
						d={compact ? artwork.smallSymbol : artwork.symbol}
						className="fill-(--brand-mark)"
					/>
				</g>
			)}
			{variant !== "symbol" && (
				<g transform={layout.wordmarkTransform}>
					<path d={artwork.wordmark} className="fill-(--sea-ink)" />
				</g>
			)}
		</svg>
	);
}
