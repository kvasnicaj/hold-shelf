import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PageSearchField } from "#/components/layout/page-search-field";

describe("debounced page search", () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it("keeps every keystroke while searches complete late, and restores external URL changes", async () => {
		const onSearch = vi.fn();
		const props = {
			value: "",
			placeholder: "Search",
			ariaLabel: "Search",
			onSearch,
			debounceMs: 250,
		};
		const { rerender, unmount } = render(<PageSearchField {...props} />);
		const input = screen.getByRole("searchbox");
		input.focus();
		for (const query of ["r", "re", "rea", "read"])
			fireEvent.change(input, { target: { value: query } });
		expect(input).toHaveValue("read");
		expect(onSearch).not.toHaveBeenCalled();
		await act(() => vi.advanceTimersByTime(250));
		expect(onSearch).toHaveBeenCalledExactlyOnceWith("read");
		for (const query of ["readi", "readin", "reading"])
			fireEvent.change(input, { target: { value: query } });
		rerender(
			<PageSearchField
				{...props}
				value="read"
				onSearch={(query) => onSearch(query)}
			/>,
		);
		expect(input).toHaveValue("reading");
		expect(input).toHaveFocus();
		await act(() => vi.advanceTimersByTime(250));
		expect(onSearch).toHaveBeenLastCalledWith("reading");
		expect(onSearch).toHaveBeenCalledTimes(2);
		rerender(<PageSearchField {...props} value="reading" />);
		await act(() => vi.advanceTimersByTime(500));
		expect(onSearch).toHaveBeenCalledTimes(2);

		rerender(<PageSearchField {...props} value="history" />);
		expect(input).toHaveValue("history");
		await act(() => vi.advanceTimersByTime(500));
		expect(onSearch).toHaveBeenCalledTimes(2);
		fireEvent.change(input, { target: { value: "history pending" } });
		unmount();
		await act(() => vi.advanceTimersByTime(500));
		expect(onSearch).toHaveBeenCalledTimes(2);
	});

	it("waits for composition to finish and submits the whole query when cleared", async () => {
		const onSearch = vi.fn();
		const props = {
			value: "original",
			placeholder: "Search",
			ariaLabel: "Search",
			onSearch,
			debounceMs: 250,
		};
		render(<PageSearchField {...props} />);
		const input = screen.getByRole("searchbox");
		fireEvent.compositionStart(input);
		fireEvent.change(input, { target: { value: "čtení" } });
		await act(() => vi.advanceTimersByTime(500));
		expect(onSearch).not.toHaveBeenCalled();
		fireEvent.compositionEnd(input);
		await act(() => vi.advanceTimersByTime(250));
		expect(onSearch).toHaveBeenCalledExactlyOnceWith("čtení");
		fireEvent.change(input, { target: { value: "" } });
		await act(() => vi.advanceTimersByTime(250));
		expect(onSearch).toHaveBeenLastCalledWith("");
	});
});
