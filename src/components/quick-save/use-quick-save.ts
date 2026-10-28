import { useContext } from "react";
import { QuickSaveContext } from "#/components/quick-save/quick-save-context";

export function useQuickSave() {
	const context = useContext(QuickSaveContext);
	if (!context) throw new Error("Quick save requires a QuickSaveProvider.");
	return context;
}
