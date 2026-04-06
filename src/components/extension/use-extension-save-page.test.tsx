import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useExtensionSavePage } from "#/components/extension/use-extension-save-page";
import { createArticle } from "#/server/articles";

vi.mock("#/server/articles", () => ({
	createArticle: vi.fn(),
}));

function TestHarness({ url }: { url?: string }) {
	const { message, status } = useExtensionSavePage(url);

	return (
		<div>
			<div data-testid="status">{status}</div>
			<div data-testid="message">{message}</div>
		</div>
	);
}

function deferredPromise<T>() {
	let resolve!: (value: T) => void;
	let reject!: (error: unknown) => void;

	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});

	return { promise, resolve, reject };
}

describe("useExtensionSavePage", () => {
	const createArticleMock = vi.mocked(createArticle);

	beforeEach(() => {
		createArticleMock.mockReset();
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it("reports an invalid state when no article URL is provided", async () => {
		render(<TestHarness />);

		await waitFor(() =>
			expect(screen.getByTestId("status")).toHaveTextContent("invalid"),
		);
		expect(screen.getByTestId("message")).toHaveTextContent(
			"We couldn't find an article URL to save.",
		);
		expect(createArticleMock).not.toHaveBeenCalled();
	});

	it("starts saving immediately and reports success when the article is stored", async () => {
		const pendingSave =
			deferredPromise<Awaited<ReturnType<typeof createArticle>>>();
		createArticleMock.mockReturnValue(pendingSave.promise);

		render(<TestHarness url="https://example.com/article" />);

		expect(screen.getByTestId("status")).toHaveTextContent("saving");
		expect(screen.getByTestId("message")).toHaveTextContent("");

		pendingSave.resolve({
			id: "article-1",
			userId: "user-1",
			url: "https://example.com/article",
			title: "Saved article",
			description: null,
			hostname: "example.com",
			faviconUrl: null,
			isRead: false,
			isFavorite: false,
			readAt: null,
			createdAt: new Date("2026-04-06T00:00:00.000Z"),
			updatedAt: new Date("2026-04-06T00:00:00.000Z"),
		});

		await waitFor(() =>
			expect(screen.getByTestId("status")).toHaveTextContent("saved"),
		);
		expect(screen.getByTestId("message")).toHaveTextContent(
			"Saved to your Hold Shelf library.",
		);
		expect(createArticleMock).toHaveBeenCalledWith({
			data: { url: "https://example.com/article" },
		});
	});

	it("reports duplicate saves with a helpful message", async () => {
		createArticleMock.mockRejectedValue(
			new Error("This URL is already in your library."),
		);

		render(<TestHarness url="https://example.com/article" />);

		await waitFor(() =>
			expect(screen.getByTestId("status")).toHaveTextContent("duplicate"),
		);
		expect(screen.getByTestId("message")).toHaveTextContent(
			"This article is already in your library.",
		);
	});

	it("surfaces unexpected save failures", async () => {
		createArticleMock.mockRejectedValue(new Error("Network request failed."));

		render(<TestHarness url="https://example.com/article" />);

		await waitFor(() =>
			expect(screen.getByTestId("status")).toHaveTextContent("error"),
		);
		expect(screen.getByTestId("message")).toHaveTextContent(
			"Network request failed.",
		);
	});

	it("falls back to a generic message for non-Error failures", async () => {
		createArticleMock.mockRejectedValue("boom");

		render(<TestHarness url="https://example.com/article" />);

		await waitFor(() =>
			expect(screen.getByTestId("status")).toHaveTextContent("error"),
		);
		expect(screen.getByTestId("message")).toHaveTextContent(
			"Failed to save this article.",
		);
	});
});
