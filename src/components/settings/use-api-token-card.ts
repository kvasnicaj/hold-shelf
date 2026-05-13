import { useEffect, useState } from "react";
import {
	generateApiToken,
	getApiToken,
	revokeApiToken,
} from "#/server/api-tokens";

export type ApiTokenState = {
	tokenPrefix: string;
	createdAt: Date;
	lastUsedAt: Date | null;
};

export function useApiTokenCard() {
	const [apiToken, setApiToken] = useState<ApiTokenState | null>(null);
	const [newToken, setNewToken] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [copying, setCopying] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;

		async function loadToken() {
			try {
				const token = await getApiToken();
				if (!cancelled) {
					setApiToken(token);
				}
			} catch (err) {
				if (!cancelled) {
					setError(
						err instanceof Error ? err.message : "Failed to load API token.",
					);
				}
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		}

		void loadToken();

		return () => {
			cancelled = true;
		};
	}, []);

	async function handleGenerate() {
		setError(null);
		setLoading(true);

		try {
			const generated = await generateApiToken();
			setApiToken({
				tokenPrefix: generated.tokenPrefix,
				createdAt: generated.createdAt,
				lastUsedAt: generated.lastUsedAt,
			});
			setNewToken(generated.token);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to generate API token.",
			);
		} finally {
			setLoading(false);
		}
	}

	async function handleRevoke() {
		setError(null);
		setLoading(true);

		try {
			await revokeApiToken();
			setApiToken(null);
			setNewToken(null);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to revoke API token.",
			);
		} finally {
			setLoading(false);
		}
	}

	async function handleCopy() {
		if (!newToken) {
			return;
		}

		setCopying(true);
		try {
			await navigator.clipboard.writeText(newToken);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to copy API token.",
			);
		} finally {
			setCopying(false);
		}
	}

	return {
		apiToken,
		newToken,
		loading,
		copying,
		error,
		handleGenerate,
		handleRevoke,
		handleCopy,
	};
}
