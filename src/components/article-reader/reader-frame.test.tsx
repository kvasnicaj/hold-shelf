import { fireEvent, render, screen } from "@testing-library/react";
import { createPortal } from "react-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ReaderFrame } from "#/components/article-reader/reader-frame";

describe("ReaderFrame on wide screens", () => {
	beforeEach(() => {
		vi.stubGlobal(
			"matchMedia",
			vi.fn().mockReturnValue({
				matches: true,
				addEventListener: vi.fn(),
				removeEventListener: vi.fn(),
			}),
		);
	});

	it("closes on Escape from the reader but not from a menu rendered in a portal", () => {
		const onClose = vi.fn();
		render(
			<ReaderFrame open onClose={onClose}>
				<button type="button">Inside reader</button>
				{createPortal(<button type="button">Menu item</button>, document.body)}
			</ReaderFrame>,
		);

		fireEvent.keyDown(screen.getByRole("button", { name: "Menu item" }), {
			key: "Escape",
		});
		expect(onClose).not.toHaveBeenCalled();

		fireEvent.keyDown(screen.getByRole("button", { name: "Inside reader" }), {
			key: "Escape",
		});
		expect(onClose).toHaveBeenCalledTimes(1);
	});
});
