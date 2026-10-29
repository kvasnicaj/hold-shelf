import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { useKeyboardShortcuts } from "#/components/shortcuts/use-keyboard-shortcuts";

function ShortcutHost(props: Parameters<typeof useKeyboardShortcuts>[0]) {
	useKeyboardShortcuts(props);
	return <input aria-label="Notes" />;
}

function renderHost() {
	const handlers = {
		onSave: vi.fn(),
		onSearch: vi.fn(),
		onHelp: vi.fn(),
		onNavigate: vi.fn(),
	};
	render(<ShortcutHost {...handlers} />);
	return handlers;
}

describe("useKeyboardShortcuts", () => {
	it("runs S, / and ? outside text fields", async () => {
		const user = userEvent.setup();
		const handlers = renderHost();

		await user.keyboard("s/?");

		expect(handlers.onSave).toHaveBeenCalledTimes(1);
		expect(handlers.onSearch).toHaveBeenCalledTimes(1);
		expect(handlers.onHelp).toHaveBeenCalledTimes(1);
	});

	it("navigates with G followed by a page key", async () => {
		const user = userEvent.setup();
		const handlers = renderHost();

		await user.keyboard("gh");
		await user.keyboard("gl");
		await user.keyboard("gx");
		await user.keyboard("u");

		expect(handlers.onNavigate.mock.calls).toEqual([
			["/app/home"],
			["/app/archive"],
		]);
	});

	it("ignores typing in fields and modified keys", async () => {
		const user = userEvent.setup();
		const handlers = renderHost();

		await user.type(screen.getByLabelText("Notes"), "gh s/");
		await user.click(document.body);
		await user.keyboard("{Meta>}s{/Meta}{Shift>}S{/Shift}");

		expect(handlers.onNavigate).not.toHaveBeenCalled();
		expect(handlers.onSave).not.toHaveBeenCalled();
		expect(handlers.onSearch).not.toHaveBeenCalled();
	});
});
