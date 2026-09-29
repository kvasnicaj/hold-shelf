export function safeReturnPath(value: unknown): string | undefined {
	if (
		typeof value !== "string" ||
		!value.startsWith("/") ||
		value.includes("\\") ||
		Array.from(value).some((character) => character.charCodeAt(0) <= 32)
	)
		return undefined;
	try {
		const origin = "https://hold-shelf.invalid";
		const url = new URL(value, origin);
		return url.origin === origin
			? `${url.pathname}${url.search}${url.hash}`
			: undefined;
	} catch {
		return undefined;
	}
}
