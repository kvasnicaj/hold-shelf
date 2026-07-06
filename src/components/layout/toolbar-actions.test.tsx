import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	ToolbarActionsProvider,
	ToolbarCenter,
	ToolbarSlot,
	useToolbarActions,
} from "#/components/layout/toolbar-actions";

function ToolbarProbe() {
	const { actions, centerContent } = useToolbarActions();

	return (
		<div>
			<div data-testid="actions">{actions ?? "none"}</div>
			<div data-testid="center">{centerContent ?? "none"}</div>
		</div>
	);
}

describe("toolbar actions", () => {
	it("publishes toolbar actions and center content through context", () => {
		render(
			<ToolbarActionsProvider>
				<ToolbarSlot>
					<button type="button">Save article</button>
				</ToolbarSlot>
				<ToolbarCenter>
					<span>3 selected</span>
				</ToolbarCenter>
				<ToolbarProbe />
			</ToolbarActionsProvider>,
		);

		expect(screen.getByTestId("actions")).toHaveTextContent("Save article");
		expect(screen.getByTestId("center")).toHaveTextContent("3 selected");
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
	});
});
