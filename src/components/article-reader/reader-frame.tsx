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
				className="sticky top-0 h-dvh w-[clamp(34rem,38vw,52rem)] shrink-0 border-l bg-background"
				onKeyDown={(event) => {
					if (event.key === "Escape") onClose();
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
					className="fixed inset-0 z-50 h-dvh bg-background outline-none md:left-56"
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
