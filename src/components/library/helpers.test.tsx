import { expect, it, vi } from "vitest";
import { importLibraryFile } from "#/components/library/helpers";
import { importLibraryBatch } from "#/server/library";

const article = {
	url: "https://example.com/saved",
	title: "Saved",
	description: null,
	faviconUrl: null,
	isRead: false,
	isFavorite: true,
	createdAt: "2026-01-01T00:00:00.000Z",
	readAt: null,
	tags: [],
	content: null,
	progress: 2000,
	trashed: false,
};
function file(articles: unknown[]) {
	return {
		size: 1000,
		text: async () =>
			JSON.stringify({
				format: "hold-shelf",
				version: 1,
				exportedAt: "2026-01-01T00:00:00.000Z",
				articles,
			}),
	} as File;
}
it("validates the entire backup before writing any article", async () => {
	await expect(
		importLibraryFile(
			file([article, { ...article, url: "javascript:alert(1)" }]),
			vi.fn(),
		),
	).rejects.toThrow("No articles have been imported");
	expect(importLibraryBatch).not.toHaveBeenCalled();
});
it("reports partial progress and supports retrying a failed import without duplicates", async () => {
	vi.mocked(importLibraryBatch)
		.mockResolvedValueOnce({ imported: 1, skipped: 0 })
		.mockRejectedValueOnce(new Error("Network unavailable"));
	const backup = file([
		article,
		{ ...article, url: "https://example.com/second" },
	]);
	const progress = vi.fn();
	await expect(importLibraryFile(backup, progress)).rejects.toThrow(
		"1 new articles",
	);
	expect(progress).toHaveBeenCalledWith(1, 2);
	vi.mocked(importLibraryBatch)
		.mockResolvedValueOnce({ imported: 0, skipped: 1 })
		.mockResolvedValueOnce({ imported: 1, skipped: 0 });
	await expect(importLibraryFile(backup, progress)).resolves.toEqual({
		imported: 1,
		skipped: 1,
	});
});
