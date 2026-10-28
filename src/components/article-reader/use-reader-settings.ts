import { useEffect, useState } from "react";
import {
	DEFAULT_READER_SETTINGS,
	parseReaderSettings,
	READER_SETTINGS_KEY,
} from "#/components/article-reader/helpers";
import type { ReaderSettings } from "#/components/article-reader/types";

export function useReaderSettings() {
	const [settings, setSettings] = useState<ReaderSettings>(
		DEFAULT_READER_SETTINGS,
	);

	// Stored settings load after hydration so server and client render the same.
	useEffect(() => {
		try {
			setSettings(
				parseReaderSettings(localStorage.getItem(READER_SETTINGS_KEY)),
			);
		} catch {}
	}, []);

	function updateSettings(partial: Partial<ReaderSettings>) {
		setSettings((current) => {
			const next = { ...current, ...partial };
			try {
				localStorage.setItem(READER_SETTINGS_KEY, JSON.stringify(next));
			} catch {}
			return next;
		});
	}

	return { settings, updateSettings };
}
