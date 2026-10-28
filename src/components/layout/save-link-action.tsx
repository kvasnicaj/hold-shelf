import { Slot } from "radix-ui";
import type { ReactElement } from "react";
import { useQuickSave } from "#/components/quick-save/use-quick-save";

type SaveLinkActionProps = {
	children: ReactElement;
};

/** Makes its child open Quick save when clicked. */
export function SaveLinkAction({ children }: SaveLinkActionProps) {
	const { open } = useQuickSave();

	return <Slot.Root onClick={() => open()}>{children}</Slot.Root>;
}
