import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { useQuickSaveShortcuts } from "#/components/quick-save/use-quick-save-shortcuts";

function ShortcutHost({ onOpen }: { onOpen: (url?: string) => void }) {
	useQuickSaveShortcuts(onOpen);
	return <input aria-label="Notes" />;
}

function paste(target: Element, text: string) {
	fireEvent.paste(target, {
		clipboardData: { getData: () => text },
	});
}

describe("useQuickSaveShortcuts", () => {
	it("opens Quick save with the S key outside text fields", async () => {
		const user = userEvent.setup();
		const onOpen = vi.fn();
		render(<ShortcutHost onOpen={onOpen} />);

		await user.keyboard("s");
		expect(onOpen).toHaveBeenCalledTimes(1);

		await user.keyboard("{Meta>}s{/Meta}");
		await user.type(screen.getByLabelText("Notes"), "s");
		expect(onOpen).toHaveBeenCalledTimes(1);
	});

	it("opens prefilled when a link is pasted outside text fields", () => {
		const onOpen = vi.fn();
		render(<ShortcutHost onOpen={onOpen} />);

		paste(document.body, "overreacted.io/impossible-components");
		expect(onOpen).toHaveBeenCalledWith(
			"https://overreacted.io/impossible-components",
		);

		paste(document.body, "just some words");
		paste(screen.getByLabelText("Notes"), "https://example.com/a");
		expect(onOpen).toHaveBeenCalledTimes(1);
	});
});
