import { useState } from "react";
import { authClient } from "#/lib/auth-client";

type UseLoginPageOptions = {
	callbackURL: string;
	errorCallbackURL: string;
};

export function useLoginPage({
	callbackURL,
	errorCallbackURL,
}: UseLoginPageOptions) {
	const [error, setError] = useState("");
	const [socialLoading, setSocialLoading] = useState(false);

	async function handleGitHubSignIn() {
		setError("");
		setSocialLoading(true);

		try {
			const result = await authClient.signIn.social({
				provider: "github",
				callbackURL,
				errorCallbackURL,
			});
			if (result.error) {
				setError(result.error.message ?? "GitHub sign in failed");
				setSocialLoading(false);
			}
		} catch {
			setError("GitHub sign in failed");
			setSocialLoading(false);
		}
	}

	return {
		error,
		socialLoading,
		handleGitHubSignIn,
	};
}
