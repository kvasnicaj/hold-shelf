import { fireEvent, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { DEFAULT_READER_SETTINGS } from "#/components/article-reader/helpers";
import { ReaderBody } from "#/components/article-reader/reader-body";
import {
	finishReading,
	getReadingProgress,
	saveReadingProgress,
} from "#/server/library";
import { renderWithProviders } from "#/test/render";

it("flushes the latest scroll position on close and reopens at that position", async () => {
	const data = {
		article: {
			id: "a1",
			userId: "u1",
			url: "https://example.com",
			title: "Article",
			description: null,
			hostname: "example.com",
			faviconUrl: null,
			isRead: false,
			isFavorite: false,
			createdAt: new Date(),
			updatedAt: new Date(),
			readAt: null,
			tags: [],
		},
		content: {
			status: "ready" as const,
			markdown: "Article body",
			plainText: "Article body",
			wordCount: 2,
			fetchedAt: new Date(),
		},
	};
	vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(2000);
	vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(500);
	vi.mocked(getReadingProgress).mockResolvedValue(2000);
	vi.mocked(saveReadingProgress).mockResolvedValue({ success: true });
	const first = renderWithProviders(
		<ReaderBody data={data} settings={DEFAULT_READER_SETTINGS} />,
	);
	const scroller = first.container.firstElementChild as HTMLElement;
	await waitFor(() => expect(scroller.scrollTop).toBe(300));
	scroller.scrollTop = 900;
	fireEvent.scroll(scroller);
	first.unmount();
	await waitFor(() =>
		expect(saveReadingProgress).toHaveBeenCalledWith({
			data: { id: "a1", progress: 6000 },
		}),
	);
	const second = renderWithProviders(
		<ReaderBody data={data} settings={DEFAULT_READER_SETTINGS} />,
		{
			queryClient: first.queryClient,
		},
	);
	await waitFor(() =>
		expect((second.container.firstElementChild as HTMLElement).scrollTop).toBe(
			900,
		),
	);
});

it("marks an unread article read once the reader reaches the end", async () => {
	const article = {
		id: "a2",
		userId: "u1",
		url: "https://example.com/long",
		title: "Long article",
		description: null,
		hostname: "example.com",
		faviconUrl: null,
		isRead: false,
		isFavorite: false,
		createdAt: new Date(),
		updatedAt: new Date(),
		readAt: null,
		tags: [],
	};
	const content = {
		status: "ready" as const,
		markdown: "Long body",
		plainText: "Long body",
		wordCount: 2,
		fetchedAt: new Date(),
	};
	vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(2000);
	vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(500);
	vi.mocked(getReadingProgress).mockResolvedValue(0);
	vi.mocked(saveReadingProgress).mockResolvedValue({ success: true });
	vi.mocked(finishReading).mockResolvedValue({ success: true });
	const view = renderWithProviders(
		<ReaderBody
			data={{ article, content }}
			settings={DEFAULT_READER_SETTINGS}
		/>,
	);
	const scroller = view.container.firstElementChild as HTMLElement;
	await waitFor(() => expect(getReadingProgress).toHaveBeenCalled());
	await waitFor(() => expect(scroller.scrollTop).toBe(0));

	scroller.scrollTop = 750;
	fireEvent.scroll(scroller);
	expect(finishReading).not.toHaveBeenCalled();

	scroller.scrollTop = 1500;
	fireEvent.scroll(scroller);
	fireEvent.scroll(scroller);
	expect(finishReading).toHaveBeenCalledTimes(1);
	expect(finishReading).toHaveBeenCalledWith({ data: { id: "a2" } });
});
