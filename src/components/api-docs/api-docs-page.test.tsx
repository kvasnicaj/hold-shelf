import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ApiDocsPage } from "#/components/api-docs/api-docs-page";
import { renderWithProviders } from "#/test/render";

describe("ApiDocsPage", () => {
	it("documents the public API endpoints", () => {
		renderWithProviders(<ApiDocsPage />);

		expect(
			screen.getByRole("heading", { name: "API documentation" }),
		).toBeInTheDocument();
		expect(screen.getAllByText("/api/v1/articles")).toHaveLength(2);
		expect(screen.getAllByText("/api/extension/articles")).toHaveLength(2);
		expect(screen.queryByText("/api/auth/*")).not.toBeInTheDocument();
		expect(
			screen.getByText("Authorization: Bearer hs_your_token"),
		).toBeInTheDocument();
	});
});
