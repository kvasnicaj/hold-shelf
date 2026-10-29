import { type ReactNode, useCallback, useMemo, useState } from "react";
import { SearchContext } from "#/components/search/search-context";
import { SearchDialog } from "#/components/search/search-dialog";

type SearchProviderProps = {
	children: ReactNode;
};

export function SearchProvider({ children }: SearchProviderProps) {
	const [state, setState] = useState({ open: false, session: 0 });
	const open = useCallback(() => {
		setState((current) => ({ open: true, session: current.session + 1 }));
	}, []);
	const value = useMemo(() => ({ open }), [open]);

	return (
		<SearchContext value={value}>
			{children}
			<SearchDialog
				// A new session starts with an empty query.
				key={state.session}
				open={state.open}
				onOpenChange={(isOpen) =>
					setState((current) => ({ ...current, open: isOpen }))
				}
			/>
		</SearchContext>
	);
}
