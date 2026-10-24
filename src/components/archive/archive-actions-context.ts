import { createContext } from "react";
import type { ArchiveActions } from "#/components/archive/types";

export const ArchiveActionsContext = createContext<ArchiveActions | null>(null);
