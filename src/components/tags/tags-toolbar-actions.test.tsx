import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TagsToolbarActions } from "#/components/tags/tags-toolbar-actions";
import { renderWithProviders } from "#/test/render";

const { toolbarSlotMock, createTagDialogMock } = vi.hoisted(() => ({
	toolbarSlotMock: vi.fn(),
	createTagDialogMock: vi.fn(),
}));

vi.mock("#/components/layout/tool-box", () => ({
	ToolBox: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="tool-box">{children}</div>
	),
}));

vi.mock("#/components/layout/toolbar-actions", () => ({
	ToolbarSlot: ({ children }: { children: React.ReactNode }) => {
		toolbarSlotMock(children);
		return <div data-testid="toolbar-slot">{children}</div>;
	},
}));

vi.mock("#/components/tags/create-tag-dialog", () => ({
	CreateTagDialog: (props: {
		onCreate: (name: string) => Promise<void>;
		triggerAriaLabel?: string;
		collapseLabelOnMobile?: boolean;
	}) => {
		createTagDialogMock(props);
		return (
			<button type="button" onClick={() => props.onCreate("Research")}>
				{props.triggerAriaLabel}
			</button>
		);
	},
}));

describe("TagsToolbarActions", () => {
	beforeEach(() => {
		toolbarSlotMock.mockClear();
		createTagDialogMock.mockClear();
	});

	it("renders the create-tag action inside a toolbar slot", async () => {
		const user = userEvent.setup();
		const onCreate = vi.fn().mockResolvedValue(undefined);

		renderWithProviders(<TagsToolbarActions onCreate={onCreate} />);

		expect(screen.getByTestId("toolbar-slot")).toBeInTheDocument();
		expect(screen.getByTestId("tool-box")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Create tag" }),
		).toBeInTheDocument();
		expect(createTagDialogMock.mock.calls[0]?.[0]).toEqual(
			expect.objectContaining({
				onCreate,
				triggerAriaLabel: "Create tag",
				collapseLabelOnMobile: true,
			}),
		);

		await user.click(screen.getByRole("button", { name: "Create tag" }));
		expect(onCreate).toHaveBeenCalledWith("Research");
	});
});
