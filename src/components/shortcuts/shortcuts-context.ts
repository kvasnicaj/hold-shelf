import { createContext } from "react";
import type { ShortcutsContextValue } from "#/components/shortcuts/types";

export const ShortcutsContext = createContext<ShortcutsContextValue | null>(
	null,
);
