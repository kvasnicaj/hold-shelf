import { useContext } from "react";
import { SearchContext } from "#/components/search/search-context";

export function useSearch() {
	const context = useContext(SearchContext);
	if (!context) throw new Error("Search requires a SearchProvider.");
	return context;
}
