import { useNavigate } from "@tanstack/react-router";
import { type ReactNode, useMemo, useState } from "react";
import { useQuickSave } from "#/components/quick-save/use-quick-save";
import { useSearch } from "#/components/search/use-search";
import { KeyboardShortcutsDialog } from "#/components/shortcuts/keyboard-shortcuts-dialog";
import { ShortcutsContext } from "#/components/shortcuts/shortcuts-context";
import { useKeyboardShortcuts } from "#/components/shortcuts/use-keyboard-shortcuts";

type ShortcutsProviderProps = {
	children: ReactNode;
};

export function ShortcutsProvider({ children }: ShortcutsProviderProps) {
	const [helpOpen, setHelpOpen] = useState(false);
	const quickSave = useQuickSave();
	const search = useSearch();
	const navigate = useNavigate();
	const value = useMemo(() => ({ openHelp: () => setHelpOpen(true) }), []);

	useKeyboardShortcuts({
		onSave: () => quickSave.open(),
		onSearch: search.open,
		onHelp: () => setHelpOpen(true),
		onNavigate: (href) => void navigate({ to: href }),
	});

	return (
		<ShortcutsContext value={value}>
			{children}
			<KeyboardShortcutsDialog open={helpOpen} onOpenChange={setHelpOpen} />
		</ShortcutsContext>
	);
}
