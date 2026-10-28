import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ReaderPreferences } from "#/components/article-reader/reader-preferences";
import { renderWithProviders } from "#/test/render";

describe("ReaderPreferences", () => {
	it("changes text size, line width and font from the Aa menu", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		renderWithProviders(
			<ReaderPreferences
				settings={{ fontSize: 24, width: "normal", font: "serif" }}
				onChange={onChange}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Reading settings" }));

		expect(screen.getByText("24 px")).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Larger text" })).toBeDisabled();
		await user.click(screen.getByRole("button", { name: "Smaller text" }));
		expect(onChange).toHaveBeenLastCalledWith({ fontSize: 23 });

		await user.click(screen.getByRole("radio", { name: "Wide" }));
		expect(onChange).toHaveBeenLastCalledWith({ width: "wide" });

		await user.click(screen.getByRole("radio", { name: "Sans" }));
		expect(onChange).toHaveBeenLastCalledWith({ font: "sans" });
	});
});
