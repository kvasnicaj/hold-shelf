import { useEffect, useRef, useState } from "react";
import { createArticle } from "#/server/articles";

type SaveStatus =
	| "idle"
	| "saving"
	| "saved"
	| "duplicate"
	| "invalid"
	| "error";

export function useSavePage(url?: string) {
	const [message, setMessage] = useState(
		url
			? "Confirm to add this article to your library."
			: "We couldn't find an article URL to save.",
	);
	const [status, setStatus] = useState<SaveStatus>(url ? "idle" : "invalid");
	const pending = useRef(false);
	const generation = useRef(0);

	useEffect(() => {
		generation.current += 1;
		pending.current = false;
		setStatus(url ? "idle" : "invalid");
		setMessage(
			url
				? "Confirm to add this article to your library."
				: "We couldn't find an article URL to save.",
		);
		return () => {
			generation.current += 1;
		};
	}, [url]);

	async function save() {
		if (!url || pending.current || status === "saved" || status === "duplicate")
			return;
		pending.current = true;
		const currentGeneration = generation.current;
		setStatus("saving");
		setMessage("");
		try {
			await createArticle({ data: { url } });
			if (currentGeneration !== generation.current) return;
			setStatus("saved");
			setMessage("Saved to your Hold Shelf library.");
		} catch (error) {
			if (currentGeneration !== generation.current) return;
			if (
				error instanceof Error &&
				error.message === "This URL is already in your library."
			) {
				setStatus("duplicate");
				setMessage("This article is already in your library.");
			} else {
				setStatus("error");
				setMessage(
					error instanceof Error
						? error.message
						: "Failed to save this article.",
				);
			}
		} finally {
			if (currentGeneration === generation.current) pending.current = false;
		}
	}

	return { message, status, save };
}
