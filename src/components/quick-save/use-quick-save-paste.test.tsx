import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useQuickSavePaste } from "#/components/quick-save/use-quick-save-paste";

function PasteHost({ onOpen }: { onOpen: (url?: string) => void }) {
	useQuickSavePaste(onOpen);
	return <input aria-label="Notes" />;
}

function paste(target: Element, text: string) {
	fireEvent.paste(target, {
		clipboardData: { getData: () => text },
	});
}

describe("useQuickSavePaste", () => {
	it("opens prefilled when a link is pasted outside text fields", () => {
		const onOpen = vi.fn();
		render(<PasteHost onOpen={onOpen} />);

		paste(document.body, "overreacted.io/impossible-components");
		expect(onOpen).toHaveBeenCalledWith(
			"https://overreacted.io/impossible-components",
		);

		paste(document.body, "just some words");
		paste(screen.getByLabelText("Notes"), "https://example.com/a");
		expect(onOpen).toHaveBeenCalledTimes(1);
	});
});
