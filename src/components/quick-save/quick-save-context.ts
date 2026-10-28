import { createContext } from "react";
import type { QuickSaveContextValue } from "#/components/quick-save/types";

export const QuickSaveContext = createContext<QuickSaveContextValue | null>(
	null,
);
