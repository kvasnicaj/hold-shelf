import { createContext } from "react";
import type { SearchContextValue } from "#/components/search/types";

export const SearchContext = createContext<SearchContextValue | null>(null);
