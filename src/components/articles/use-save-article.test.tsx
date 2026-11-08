import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import type * as React from "react";
import { expect, it, vi } from "vitest";
import { useSaveArticle } from "#/components/articles/use-save-article";
import { createArticle } from "#/server/articles";
import { addTagToArticles } from "#/server/tags";
import { createTestQueryClient } from "#/test/render";

vi.mock("@tanstack/react-router", () => ({
	useRouter: () => ({ invalidate: vi.fn() }),
}));
vi.mock("#/server/articles", () => ({ createArticle: vi.fn() }));
vi.mock("#/server/tags", () => ({ addTagToArticles: vi.fn() }));

it("reports a saved link whose tags only partly applied instead of a failed save", async () => {
	vi.mocked(createArticle).mockResolvedValue({ id: "a1" } as Awaited<
		ReturnType<typeof createArticle>
	>);
	vi.mocked(addTagToArticles)
		.mockRejectedValueOnce(new Error("Tag limit reached"))
		.mockResolvedValueOnce({ success: true } as Awaited<
			ReturnType<typeof addTagToArticles>
		>);
	const client = createTestQueryClient();
	const { result } = renderHook(() => useSaveArticle(), {
		wrapper: ({ children }: { children: React.ReactNode }) => (
			<QueryClientProvider client={client}>{children}</QueryClientProvider>
		),
	});

	await expect(
		result.current.handleAdd("https://example.com", ["broken", "t2"]),
	).resolves.toEqual({ article: { id: "a1" }, failedTagCount: 1 });
	expect(addTagToArticles).toHaveBeenCalledWith({
		data: { tagId: "t2", articleIds: ["a1"] },
	});
});
