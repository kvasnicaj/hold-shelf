import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AppPagination } from "#/components/pagination/app-pagination";
import { renderWithProviders } from "#/test/render";

describe("AppPagination", () => {
	it("returns null when there is only one page", () => {
		const { container } = renderWithProviders(
			<AppPagination page={1} totalPages={1} onPageChange={vi.fn()} />,
		);

		expect(container).toBeEmptyDOMElement();
	});

	it("navigates between pages and ignores clicks for the current page", async () => {
		const user = userEvent.setup();
		const onPageChange = vi.fn();

		renderWithProviders(
			<AppPagination page={3} totalPages={5} onPageChange={onPageChange} />,
		);

		await user.click(screen.getByRole("link", { name: "Go to previous page" }));
		await user.click(screen.getByRole("link", { name: "Go to page 4" }));
		await user.click(screen.getByRole("link", { name: "Go to page 3" }));
		await user.click(screen.getByRole("link", { name: "Go to next page" }));

		expect(onPageChange).toHaveBeenNthCalledWith(1, 2);
		expect(onPageChange).toHaveBeenNthCalledWith(2, 4);
		expect(onPageChange).toHaveBeenNthCalledWith(3, 4);
		expect(onPageChange).toHaveBeenCalledTimes(3);
		expect(screen.getByRole("link", { name: "Go to page 3" })).toHaveAttribute(
			"aria-current",
			"page",
		);
	});

	it("disables previous and next links at the boundaries", async () => {
		const user = userEvent.setup();
		const onPageChange = vi.fn();

		const { rerender } = renderWithProviders(
			<AppPagination page={1} totalPages={3} onPageChange={onPageChange} />,
		);

		const previous = screen.getByLabelText("Go to previous page");
		expect(previous).toHaveAttribute("aria-disabled", "true");
		expect(previous).toHaveAttribute("tabindex", "-1");
		await user.click(previous);
		expect(onPageChange).not.toHaveBeenCalled();

		rerender(
			<AppPagination page={3} totalPages={3} onPageChange={onPageChange} />,
		);

		const next = screen.getByLabelText("Go to next page");
		expect(next).toHaveAttribute("aria-disabled", "true");
		expect(next).toHaveAttribute("tabindex", "-1");
		await user.click(next);
		expect(onPageChange).not.toHaveBeenCalled();
	});
});
