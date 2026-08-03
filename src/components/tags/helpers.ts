export function buildTagShareUrl(token: string, origin?: string) {
	const path = `/share/${encodeURIComponent(token)}`;
	return origin ? new URL(path, origin).toString() : path;
}
