import { useState } from "react";
import { authClient } from "#/lib/auth-client";

export function useLoginPage() {
	const [error, setError] = useState("");
	const [socialLoading, setSocialLoading] = useState(false);

	async function handleGitHubSignIn() {
		setError("");
		setSocialLoading(true);

		try {
			const result = await authClient.signIn.social({
				provider: "github",
				callbackURL: "/app/home",
				errorCallbackURL: "/login",
			});
			if (result.error) {
				setError(result.error.message ?? "GitHub sign in failed");
			}
		} catch {
			setError("GitHub sign in failed");
		} finally {
			setSocialLoading(false);
		}
	}

	return {
		error,
		socialLoading,
		handleGitHubSignIn,
	};
}
