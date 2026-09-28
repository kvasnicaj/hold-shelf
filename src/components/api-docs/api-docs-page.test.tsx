import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ApiDocsPage } from "#/components/api-docs/api-docs-page";
import { renderWithProviders } from "#/test/render";

describe("ApiDocsPage", () => {
	it("documents the public API endpoints", () => {
		renderWithProviders(<ApiDocsPage />);

		expect(
			screen.getByRole("heading", { name: "REST API documentation" }),
		).toBeInTheDocument();
		expect(screen.getByText("/api/v1/me")).toBeInTheDocument();
		expect(screen.getAllByText("/api/v1/articles")).toHaveLength(2);
		expect(screen.getAllByText("/api/v1/articles/:id")).toHaveLength(3);
		expect(
			screen.getAllByText("/api/v1/articles/:id/tags/:tagId"),
		).toHaveLength(2);
		expect(screen.getByText("/api/v1/tags")).toBeInTheDocument();
		expect(screen.getByText("/api/v1/dashboard")).toBeInTheDocument();
		expect(screen.getAllByText("/api/extension/articles")).toHaveLength(2);
		expect(screen.queryByText("/api/auth/*")).not.toBeInTheDocument();
		expect(
			screen.getByText("Authorization: Bearer hs_your_token"),
		).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /export agent docs/i }),
		).toHaveAttribute("href", "/api-docs/agents");
		expect(
			screen.getByText(/create, regenerate, or revoke your one active token/i),
		).toBeInTheDocument();
	});
});
