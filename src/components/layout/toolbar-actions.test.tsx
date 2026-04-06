import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
	ToolbarActionsProvider,
	ToolbarCenter,
	ToolbarSearch,
	ToolbarSlot,
	useToolbarActions,
} from "#/components/layout/toolbar-actions";

function ToolbarProbe() {
	const { actions, centerContent, searchConfig } = useToolbarActions();

	return (
		<div>
			<div data-testid="actions">{actions ?? "none"}</div>
			<div data-testid="center">{centerContent ?? "none"}</div>
			<div data-testid="search-placeholder">
				{searchConfig?.placeholder ?? "none"}
			</div>
			<div data-testid="search-value">{searchConfig?.value ?? "none"}</div>
			<button
				type="button"
				onClick={() => searchConfig?.onSearch("fresh query")}
				disabled={!searchConfig}
			>
				Run search
			</button>
		</div>
	);
}

describe("toolbar actions", () => {
	it("publishes toolbar actions, center content, and search config through context", async () => {
		const user = userEvent.setup();
		const onSearch = vi.fn();

		render(
			<ToolbarActionsProvider>
				<ToolbarSlot>
					<button type="button">Save article</button>
				</ToolbarSlot>
				<ToolbarCenter>
					<span>3 selected</span>
				</ToolbarCenter>
				<ToolbarSearch
					placeholder="Search library"
					value="design"
					onSearch={onSearch}
				/>
				<ToolbarProbe />
			</ToolbarActionsProvider>,
		);

		expect(screen.getByTestId("actions")).toHaveTextContent("Save article");
		expect(screen.getByTestId("center")).toHaveTextContent("3 selected");
		expect(screen.getByTestId("search-placeholder")).toHaveTextContent(
			"Search library",
		);
		expect(screen.getByTestId("search-value")).toHaveTextContent("design");

		await user.click(screen.getByRole("button", { name: "Run search" }));
		expect(onSearch).toHaveBeenCalledWith("fresh query");
	});

	it("clears toolbar state when slots unmount", () => {
		const { rerender } = render(
			<ToolbarActionsProvider>
				<ToolbarSlot>
					<button type="button">Save article</button>
				</ToolbarSlot>
				<ToolbarCenter>
					<span>3 selected</span>
				</ToolbarCenter>
				<ToolbarSearch
					placeholder="Search library"
					value="design"
					onSearch={vi.fn()}
				/>
				<ToolbarProbe />
			</ToolbarActionsProvider>,
		);

		rerender(
			<ToolbarActionsProvider>
				<ToolbarProbe />
			</ToolbarActionsProvider>,
		);

		expect(screen.getByTestId("actions")).toHaveTextContent("none");
		expect(screen.getByTestId("center")).toHaveTextContent("none");
		expect(screen.getByTestId("search-placeholder")).toHaveTextContent("none");
		expect(screen.getByTestId("search-value")).toHaveTextContent("none");
		expect(screen.getByRole("button", { name: "Run search" })).toBeDisabled();
	});
});
