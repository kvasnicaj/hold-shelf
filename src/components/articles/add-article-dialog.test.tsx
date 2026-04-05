import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AddArticleDialog } from "#/components/articles/add-article-dialog";
import { renderWithProviders } from "#/test/render";

describe("AddArticleDialog", () => {
	it("shows a validation error for invalid URLs", async () => {
		const user = userEvent.setup();
		renderWithProviders(<AddArticleDialog onAdd={vi.fn()} />);

		await user.click(screen.getByRole("button", { name: /add article/i }));
		await user.type(screen.getByLabelText("URL"), "not-a-url");
		const form = screen
			.getByRole("button", { name: /^save$/i })
			.closest("form");
		if (!form) {
			throw new Error("Expected add article form");
		}

		fireEvent.submit(form);

		expect(screen.getByText("Please enter a valid URL")).toBeInTheDocument();
	});

	it("submits valid URLs through onAdd", async () => {
		const user = userEvent.setup();
		const onAdd = vi.fn().mockResolvedValue(undefined);
		renderWithProviders(<AddArticleDialog onAdd={onAdd} />);

		await user.click(screen.getByRole("button", { name: /add article/i }));
		await user.type(
			screen.getByLabelText("URL"),
			"https://example.com/articles/testing",
		);
		await user.click(screen.getByRole("button", { name: /^save$/i }));

		await waitFor(() =>
			expect(onAdd).toHaveBeenCalledWith(
				"https://example.com/articles/testing",
			),
		);
	});

	it("shows loading and server error states during submission", async () => {
		const user = userEvent.setup();
		let release = () => {};
		const onAdd = vi.fn().mockImplementation(
			() =>
				new Promise<void>((resolve) => {
					release = resolve;
				}),
		);
		renderWithProviders(<AddArticleDialog onAdd={onAdd} />);

		await user.click(screen.getByRole("button", { name: /add article/i }));
		await user.type(
			screen.getByLabelText("URL"),
			"https://example.com/loading",
		);
		await user.click(screen.getByRole("button", { name: /^save$/i }));

		expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
		release();
		await waitFor(() =>
			expect(
				screen.queryByRole("button", { name: /saving/i }),
			).not.toBeInTheDocument(),
		);

		const failingOnAdd = vi
			.fn()
			.mockRejectedValue(new Error("Metadata fetch failed"));
		renderWithProviders(<AddArticleDialog onAdd={failingOnAdd} />);

		const addArticleButtons = screen.getAllByRole("button", {
			name: /add article/i,
		});
		const latestAddArticleButton =
			addArticleButtons[addArticleButtons.length - 1];
		if (!latestAddArticleButton) {
			throw new Error("Expected add article button");
		}

		await user.click(latestAddArticleButton);
		await user.type(screen.getByLabelText("URL"), "https://example.com/error");
		await user.click(screen.getByRole("button", { name: /^save$/i }));

		await waitFor(() =>
			expect(screen.getByText("Metadata fetch failed")).toBeInTheDocument(),
		);
	});
});
