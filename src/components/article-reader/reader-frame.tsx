import { Dialog } from "radix-ui";
import { type ReactNode, useEffect, useRef, useState } from "react";

type ReaderFrameProps = {
	open: boolean;
	onClose: () => void;
	children: ReactNode;
};
export function ReaderFrame({ open, onClose, children }: ReaderFrameProps) {
	const [wide, setWide] = useState(false);
	const returnFocus = useRef<HTMLElement | null>(null);
	useEffect(() => {
		const media = matchMedia("(min-width: 1536px)");
		const update = () => setWide(media.matches);
		update();
		media.addEventListener("change", update);
		return () => media.removeEventListener("change", update);
	}, []);
	if (wide)
		return open ? (
			<aside
				aria-label="Article reader"
				className="sticky top-2 my-2 mr-2 h-[calc(100dvh-1rem)] w-[clamp(34rem,38vw,52rem)] shrink-0 overflow-hidden rounded-xl border bg-card"
				onKeyDown={(event) => {
					// Menus render in portals; their Escape should close only the menu.
					if (
						event.key === "Escape" &&
						event.currentTarget.contains(event.target as Node)
					) {
						onClose();
					}
				}}
			>
				{children}
			</aside>
		) : null;
	return (
		<Dialog.Root
			open={open}
			onOpenChange={(next) => {
				if (!next) onClose();
			}}
		>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/35" />
				<Dialog.Content
					aria-describedby={undefined}
					className="fixed inset-0 z-50 h-dvh bg-card outline-none md:inset-y-2 md:right-2 md:left-56 md:h-auto md:overflow-hidden md:rounded-xl md:border"
					onOpenAutoFocus={() => {
						returnFocus.current = document.activeElement as HTMLElement;
					}}
					onCloseAutoFocus={(event) => {
						event.preventDefault();
						returnFocus.current?.focus();
					}}
				>
					<Dialog.Title className="sr-only">Article reader</Dialog.Title>
					{children}
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
