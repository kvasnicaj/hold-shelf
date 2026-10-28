import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ApiDocsPage } from "#/components/api-docs/api-docs-page";
import { renderWithProviders } from "#/test/render";

vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);
	return {
		...actual,
		Link: ({
			children,
			to,
			className,
		}: {
			children: React.ReactNode;
			to: string;
			className?: string;
		}) => (
			<a href={to} className={className}>
				{children}
			</a>
		),
	};
});

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
