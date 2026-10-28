import { useState } from "react";
import { cn } from "#/lib/utils";

type UserAvatarProps = {
	name?: string | null;
	image?: string | null;
	className?: string;
};

export function UserAvatar({ name, image, className }: UserAvatarProps) {
	const [imageFailed, setImageFailed] = useState(false);
	const initial = name?.trim().charAt(0).toUpperCase() || "?";

	return (
		<span
			aria-hidden="true"
			className={cn(
				"inline-flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-select text-[11px] font-bold text-foreground",
				className,
			)}
		>
			{image && !imageFailed ? (
				<img
					src={image}
					alt=""
					className="size-full object-cover"
					onError={() => setImageFailed(true)}
				/>
			) : (
				initial
			)}
		</span>
	);
}
