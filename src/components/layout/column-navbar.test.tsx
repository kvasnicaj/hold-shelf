import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ColumnNavbar } from "#/components/layout/column-navbar";

describe("ColumnNavbar", () => {
	it("renders left, center, right slots and a mobile overflow trigger", () => {
		render(
			<ColumnNavbar
				aria-label="Library column"
				left={[
					<button key="left" type="button">
						Left action
					</button>,
				]}
				center={[<input key="center" aria-label="Search articles" />]}
				right={[
					<button key="right" type="button">
						Right action
					</button>,
				]}
				mobileMenuLabel="More library actions"
			/>,
		);

		const navbar = screen.getByRole("navigation", { name: "Library column" });

		expect(
			within(navbar).getAllByRole("button", { name: "Left action" }),
		).toHaveLength(2);
		expect(
			within(navbar).getByLabelText("Search articles"),
		).toBeInTheDocument();
		expect(
			within(navbar).getByRole("button", { name: "More library actions" }),
		).toBeInTheDocument();
	});
});
