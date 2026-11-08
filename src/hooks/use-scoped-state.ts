import { type SetStateAction, useState } from "react";

/**
 * State that belongs to one view, such as the selection in a filtered,
 * paginated list. When `scope` changes the value falls back to `initial`,
 * so nothing chosen in an earlier view can act on items no longer shown.
 */
export function useScopedState<T>(scope: string, initial: T) {
	const [state, setState] = useState({ scope, value: initial });
	const value = state.scope === scope ? state.value : initial;

	function setValue(action: SetStateAction<T>) {
		setState((current) => {
			const previous = current.scope === scope ? current.value : initial;
			return {
				scope,
				value:
					typeof action === "function"
						? (action as (previous: T) => T)(previous)
						: action,
			};
		});
	}

	return [value, setValue] as const;
}
