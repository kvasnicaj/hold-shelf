import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { getDeleteAccountErrorMessage } from "#/components/settings/helpers";
import { authClient } from "#/lib/auth-client";

const DELETE_CONFIRMATION = "DELETE";

export function useDeleteAccount() {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [confirmation, setConfirmation] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const isConfirmationValid =
		confirmation.trim().toUpperCase() === DELETE_CONFIRMATION;

	function reset() {
		setConfirmation("");
		setLoading(false);
		setError("");
	}

	async function handleDeleteAccount() {
		setError("");

		if (!isConfirmationValid) {
			setError("Type DELETE to confirm account deletion.");
			return;
		}

		setLoading(true);

		try {
			const result = await authClient.deleteUser({});

			if (result.error) {
				setError(getDeleteAccountErrorMessage(result.error));
				setLoading(false);
				return;
			}

			setOpen(false);
			reset();
			await router.navigate({ to: "/login" });
		} catch {
			setError("Failed to delete account.");
			setLoading(false);
		}
	}

	return {
		open,
		confirmation,
		loading,
		error,
		isConfirmationValid,
		setConfirmation,
		handleDeleteAccount,
		handleOpenChange: (value: boolean) => {
			setOpen(value);
			if (!value) reset();
		},
	};
}
