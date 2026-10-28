import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { QuickSaveForm } from "#/components/quick-save/quick-save-form";
import { renderWithProviders } from "#/test/render";

const tags = [
	{ id: "t1", name: "Design", color: null },
	{ id: "t2", name: "React", color: null },
];

describe("QuickSaveForm", () => {
	it("previews the site and saves with the chosen tags on Enter", async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn().mockResolvedValue(undefined);
		renderWithProviders(<QuickSaveForm tags={tags} onSubmit={onSubmit} />);

		await user.type(
			screen.getByLabelText("Link"),
			"www.overreacted.io/impossible-components",
		);
		expect(
			screen.getByText("overreacted.io · Saves to Unread"),
		).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "React" }));
		await user.click(screen.getByLabelText("Link"));
		await user.keyboard("{Enter}");

		expect(onSubmit).toHaveBeenCalledWith(
			"https://www.overreacted.io/impossible-components",
			["t2"],
			"save",
		);
	});

	it("saves and opens the reader on Shift+Enter", async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn().mockResolvedValue(undefined);
		renderWithProviders(
			<QuickSaveForm
				tags={[]}
				initialUrl="https://sqlite.org/lang.html"
				onSubmit={onSubmit}
			/>,
		);

		await user.click(screen.getByLabelText("Link"));
		await user.keyboard("{Shift>}{Enter}{/Shift}");

		expect(onSubmit).toHaveBeenCalledWith(
			"https://sqlite.org/lang.html",
			[],
			"read",
		);
	});

	it("explains what is wrong instead of saving", async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();
		renderWithProviders(<QuickSaveForm tags={[]} onSubmit={onSubmit} />);

		await user.type(screen.getByLabelText("Link"), "read this later{Enter}");

		expect(
			screen.getByText(
				"That doesn't look like a link yet. Links start with https://",
			),
		).toBeInTheDocument();
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it("shows the server's reason when saving fails and allows a retry", async () => {
		const user = userEvent.setup();
		const onSubmit = vi
			.fn()
			.mockRejectedValue(new Error("This URL is already in your library."));
		renderWithProviders(
			<QuickSaveForm
				tags={[]}
				initialUrl="https://sqlite.org/lang.html"
				onSubmit={onSubmit}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Save" }));

		await waitFor(() =>
			expect(
				screen.getByText("This URL is already in your library."),
			).toBeInTheDocument(),
		);
		expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
	});
});
