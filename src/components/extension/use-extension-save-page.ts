import { useEffect, useState } from "react";
import { createArticle } from "#/server/articles";

type ExtensionSaveStatus =
	| "idle"
	| "saving"
	| "saved"
	| "duplicate"
	| "invalid"
	| "error";

export function useExtensionSavePage(url?: string) {
	const [message, setMessage] = useState("");
	const [status, setStatus] = useState<ExtensionSaveStatus>(
		url ? "saving" : "invalid",
	);

	useEffect(() => {
		if (!url) {
			setStatus("invalid");
			setMessage("We couldn't find an article URL to save.");
			return;
		}

		let cancelled = false;

		async function saveArticle() {
			setStatus("saving");
			setMessage("");

			try {
				await createArticle({ data: { url } });
				if (cancelled) {
					return;
				}
				setStatus("saved");
				setMessage("Saved to your Hold Shelf library.");
			} catch (error) {
				if (cancelled) {
					return;
				}

				if (
					error instanceof Error &&
					error.message === "This URL is already in your library."
				) {
					setStatus("duplicate");
					setMessage("This article is already in your library.");
					return;
				}

				setStatus("error");
				setMessage(
					error instanceof Error
						? error.message
						: "Failed to save this article.",
				);
			}
		}

		void saveArticle();

		return () => {
			cancelled = true;
		};
	}, [url]);

	return {
		message,
		status,
	};
}
