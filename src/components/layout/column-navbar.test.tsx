import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ColumnNavbar } from "#/components/layout/column-navbar";

describe("ColumnNavbar", () => {
	it("renders every slot item directly, without hiding any behind an unlabeled strip", () => {
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
			/>,
		);

		const navbar = screen.getByRole("navigation", { name: "Library column" });

		expect(
			within(navbar).getByRole("button", { name: "Left action" }),
		).toBeInTheDocument();
		expect(
			within(navbar).getByLabelText("Search articles"),
		).toBeInTheDocument();
		expect(
			within(navbar).getByRole("button", { name: "Right action" }),
		).toBeInTheDocument();
	});
});
