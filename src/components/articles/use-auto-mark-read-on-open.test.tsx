import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import type * as React from "react";
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAutoMarkReadOnOpen } from "#/components/articles/use-auto-mark-read-on-open";
import { createTestQueryClient } from "#/test/render";

const { openArticleMock, routeState, routerInvalidateMock, updateArticleMock } =
	vi.hoisted(() => ({
		openArticleMock: vi.fn(),
		routeState: {
			loaderData: {
				settings: {
					markReadOnOpen: true,
				},
			},
		},
		routerInvalidateMock: vi.fn(),
		updateArticleMock: vi.fn(),
	}));

vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);

	return {
		...actual,
		getRouteApi: () => ({
			useLoaderData: () => routeState.loaderData,
		}),
		useRouter: () => ({
			invalidate: routerInvalidateMock,
		}),
	};
});

vi.mock("#/server/articles", () => ({
	updateArticle: updateArticleMock,
}));

vi.mock("#/components/article-reader/use-article-reader", () => ({
	useArticleReader: () => ({
		openArticle: openArticleMock,
	}),
}));

describe("useAutoMarkReadOnOpen", () => {
	beforeEach(() => {
		openArticleMock.mockReset();
		routeState.loaderData.settings.markReadOnOpen = true;
		routerInvalidateMock.mockReset().mockResolvedValue(undefined);
		updateArticleMock.mockReset().mockResolvedValue({ success: true });
	});

	it("marks unread articles as read when the setting is enabled", async () => {
		const queryClient = createTestQueryClient();
		const invalidateQueriesMock = vi.spyOn(queryClient, "invalidateQueries");
		const wrapper = ({ children }: React.PropsWithChildren) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);
		const { result } = renderHook(() => useAutoMarkReadOnOpen(), { wrapper });

		await act(async () => {
			await result.current.handleOpenArticle("a1", false);
		});

		expect(updateArticleMock).toHaveBeenCalledWith({
			data: { id: "a1", isRead: true },
		});
		expect(openArticleMock).toHaveBeenCalledWith("a1");
		expect(invalidateQueriesMock).toHaveBeenCalledWith({
			queryKey: ["articles"],
		});
		expect(routerInvalidateMock).toHaveBeenCalled();
	});

	it("does not update an article that is already read", async () => {
		const queryClient = createTestQueryClient();
		const invalidateQueriesMock = vi.spyOn(queryClient, "invalidateQueries");
		const wrapper = ({ children }: React.PropsWithChildren) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);
		const { result } = renderHook(() => useAutoMarkReadOnOpen(), { wrapper });

		await act(async () => {
			await result.current.handleOpenArticle("a1", true);
		});

		expect(updateArticleMock).not.toHaveBeenCalled();
		expect(openArticleMock).toHaveBeenCalledWith("a1");
		expect(invalidateQueriesMock).not.toHaveBeenCalled();
		expect(routerInvalidateMock).not.toHaveBeenCalled();
	});

	it("does not update when auto-mark-read is disabled", async () => {
		routeState.loaderData.settings.markReadOnOpen = false;
		const queryClient = createTestQueryClient();
		const invalidateQueriesMock = vi.spyOn(queryClient, "invalidateQueries");
		const wrapper = ({ children }: React.PropsWithChildren) => (
			<QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
		);
		const { result } = renderHook(() => useAutoMarkReadOnOpen(), { wrapper });

		await act(async () => {
			await result.current.handleOpenArticle("a1", false);
		});

		expect(updateArticleMock).not.toHaveBeenCalled();
		expect(openArticleMock).toHaveBeenCalledWith("a1");
		expect(invalidateQueriesMock).not.toHaveBeenCalled();
		expect(routerInvalidateMock).not.toHaveBeenCalled();
	});
});
