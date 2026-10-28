import type { LucideIcon } from "lucide-react";
import { cn } from "#/lib/utils";

type MobileNavTabContentProps = {
	icon: LucideIcon;
	label: string;
	isActive?: boolean;
	badge?: number;
	primary?: boolean;
};

export function MobileNavTabContent({
	icon: Icon,
	label,
	isActive = false,
	badge,
	primary = false,
}: MobileNavTabContentProps) {
	return (
		<>
			<span
				className={cn(
					"relative flex h-8 items-center justify-center",
					primary
						? "w-11 rounded-lg bg-primary text-primary-foreground"
						: "w-10 after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-4.5 after:-translate-x-1/2 after:rounded-full",
					isActive && "text-mark after:bg-mark",
				)}
			>
				<Icon className={primary ? "size-5" : "size-[1.375rem]"} />
				{badge !== undefined && (
					<span
						aria-hidden="true"
						className="absolute -top-0.5 right-0 min-w-4 rounded-sm bg-primary px-1 text-center text-[10px] font-bold leading-4 tabular-nums text-primary-foreground"
					>
						{badge}
					</span>
				)}
			</span>
			<span className="max-w-full truncate">
				{label}
				{badge !== undefined && <span className="sr-only"> {badge}</span>}
			</span>
		</>
	);
}
