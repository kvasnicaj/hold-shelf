import { useEffect, useState } from "react";

/** Controlled demos use React state so they also work as portable browser tests. */
export function useStoryState<T extends object>(args: T) {
	const [state, setState] = useState(args);
	useEffect(() => setState(args), [args]);
	function updateState(partial: Partial<T>) {
		setState((current) => ({ ...current, ...partial }));
	}
	return [state, updateState] as const;
}
