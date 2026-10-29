import { type ReactNode, useCallback, useMemo, useState } from "react";
import { QuickSaveContext } from "#/components/quick-save/quick-save-context";
import { QuickSaveDialog } from "#/components/quick-save/quick-save-dialog";
import { useQuickSavePaste } from "#/components/quick-save/use-quick-save-paste";

type QuickSaveProviderProps = {
	children: ReactNode;
};

export function QuickSaveProvider({ children }: QuickSaveProviderProps) {
	const [state, setState] = useState({ open: false, url: "", session: 0 });

	const open = useCallback((url = "") => {
		setState((current) => ({ open: true, url, session: current.session + 1 }));
	}, []);
	const value = useMemo(() => ({ open }), [open]);

	useQuickSavePaste(open);

	return (
		<QuickSaveContext value={value}>
			{children}
			<QuickSaveDialog
				// A new session resets the form, including a prefilled link.
				key={state.session}
				open={state.open}
				initialUrl={state.url}
				onOpenChange={(isOpen) =>
					setState((current) => ({ ...current, open: isOpen }))
				}
			/>
		</QuickSaveContext>
	);
}
