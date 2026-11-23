import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { cn } from "#/lib/utils";

type MobileNavTabContentProps = {
	icon: PhosphorIcon;
	label: string;
	isActive?: boolean;
	primary?: boolean;
};

export function MobileNavTabContent({
	icon: Icon,
	label,
	isActive = false,
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
				<Icon
					weight={isActive || primary ? "fill" : "regular"}
					className={primary ? "size-5" : "size-[1.375rem]"}
				/>
			</span>
			<span className="max-w-full truncate">{label}</span>
		</>
	);
}
