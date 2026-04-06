import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TagsToolbarActions } from "#/components/tags/tags-toolbar-actions";
import { renderWithProviders } from "#/test/render";

const { toolbarSearchMock, toolbarSlotMock, createTagDialogMock } = vi.hoisted(
	() => ({
		toolbarSearchMock: vi.fn(),
		toolbarSlotMock: vi.fn(),
		createTagDialogMock: vi.fn(),
	}),
);

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
	ToolbarSearch: (props: {
		placeholder: string;
		value: string;
		onSearch: (query: string) => void;
	}) => {
		toolbarSearchMock(props);
		return (
			<button type="button" onClick={() => props.onSearch("refined")}>
				search:{props.placeholder}:{props.value}
			</button>
		);
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
		toolbarSearchMock.mockClear();
		toolbarSlotMock.mockClear();
		createTagDialogMock.mockClear();
	});

	it("renders the create-tag action inside a toolbar slot and wires search when enabled", async () => {
		const user = userEvent.setup();
		const onCreate = vi.fn().mockResolvedValue(undefined);
		const onSearch = vi.fn();

		renderWithProviders(
			<TagsToolbarActions
				showSearch
				searchValue="design"
				onCreate={onCreate}
				onSearch={onSearch}
			/>,
		);

		expect(screen.getByTestId("toolbar-slot")).toBeInTheDocument();
		expect(screen.getByTestId("tool-box")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Create tag" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "search:Search tags...:design" }),
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

		await user.click(
			screen.getByRole("button", { name: "search:Search tags...:design" }),
		);
		expect(onSearch).toHaveBeenCalledWith("refined");
	});

	it("omits toolbar search when searching is disabled", () => {
		renderWithProviders(
			<TagsToolbarActions
				showSearch={false}
				searchValue=""
				onCreate={vi.fn().mockResolvedValue(undefined)}
				onSearch={vi.fn()}
			/>,
		);

		expect(toolbarSearchMock).not.toHaveBeenCalled();
	});
});
