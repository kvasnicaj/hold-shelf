import { useEffect, useEffectEvent, useRef, useState } from "react";

type UsePageSearchOptions = {
	value: string;
	onSearch: (query: string) => void;
	delay: number;
};

export function usePageSearch({
	value,
	onSearch,
	delay,
}: UsePageSearchOptions) {
	const [draft, setDraft] = useState(value);
	const [composing, setComposing] = useState(false);
	const submitted = useRef(new Set<string>());
	const submit = useEffectEvent(onSearch);

	useEffect(() => {
		// A completed search may arrive after the user has already typed more.
		if (submitted.current.has(value)) {
			submitted.current.delete(value);
		} else {
			submitted.current.clear();
			setDraft(value);
		}
	}, [value]);

	useEffect(() => {
		if (
			!delay ||
			composing ||
			draft === value ||
			submitted.current.has(draft.trim() ? draft : "")
		)
			return;
		const timer = setTimeout(() => {
			submitted.current.add(draft.trim() ? draft : "");
			submit(draft);
		}, delay);
		return () => clearTimeout(timer);
	}, [draft, value, delay, composing]);

	function updateDraft(query: string) {
		if (delay) setDraft(query);
		else onSearch(query);
	}

	return { draft: delay ? draft : value, updateDraft, setComposing };
}
