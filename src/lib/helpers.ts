export function chunks<T>(items: T[], size = 50): T[][] {
	return Array.from({ length: Math.ceil(items.length / size) }, (_, i) =>
		items.slice(i * size, (i + 1) * size),
	);
}
