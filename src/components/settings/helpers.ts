export function getAccountInitials(
	name?: string | null,
	email?: string | null,
) {
	const label = name?.trim() || email?.trim() || "GH";
	const [first, second] = label.split(/\s+|@/).filter(Boolean);
	return `${first?.[0] ?? "G"}${second?.[0] ?? "H"}`.toUpperCase();
}
