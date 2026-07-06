import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	ToolbarActionsProvider,
	ToolbarSlot,
	useToolbarActions,
} from "#/components/layout/toolbar-actions";

function ToolbarProbe() {
	const { actions } = useToolbarActions();

	return (
		<div>
			<div data-testid="actions">{actions ?? "none"}</div>
		</div>
	);
}

describe("toolbar actions", () => {
	it("publishes toolbar actions through context", () => {
		render(
			<ToolbarActionsProvider>
				<ToolbarSlot>
					<button type="button">Save article</button>
				</ToolbarSlot>
				<ToolbarProbe />
			</ToolbarActionsProvider>,
		);

		expect(screen.getByTestId("actions")).toHaveTextContent("Save article");
	});

	it("clears toolbar state when slots unmount", () => {
		const { rerender } = render(
			<ToolbarActionsProvider>
				<ToolbarSlot>
					<button type="button">Save article</button>
				</ToolbarSlot>
				<ToolbarProbe />
			</ToolbarActionsProvider>,
		);

		rerender(
			<ToolbarActionsProvider>
				<ToolbarProbe />
			</ToolbarActionsProvider>,
		);

		expect(screen.getByTestId("actions")).toHaveTextContent("none");
	});
});
