export function getAccountInitials(
	name?: string | null,
	email?: string | null,
) {
	const label = name?.trim() || email?.trim() || "GH";
	const [first, second] = label.split(/\s+|@/).filter(Boolean);
	return `${first?.[0] ?? "G"}${second?.[0] ?? "H"}`.toUpperCase();
}

export function getDeleteAccountErrorMessage(error?: {
	code?: string;
	message?: string | null;
}) {
	if (error?.code === "SESSION_EXPIRED") {
		return "Please sign in again, then retry deleting your account.";
	}

	return error?.message || "Failed to delete account.";
}
