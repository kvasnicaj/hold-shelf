import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

beforeEach(() => {
	Object.defineProperty(window, "matchMedia", {
		writable: true,
		value: vi.fn().mockImplementation((query: string) => ({
			matches: false,
			media: query,
			onchange: null,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			addListener: vi.fn(),
			removeListener: vi.fn(),
			dispatchEvent: vi.fn(),
		})),
	});

	Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
		writable: true,
		value: vi.fn(),
	});

	Object.defineProperty(window.HTMLElement.prototype, "hasPointerCapture", {
		writable: true,
		value: vi.fn().mockReturnValue(false),
	});

	Object.defineProperty(window.HTMLElement.prototype, "setPointerCapture", {
		writable: true,
		value: vi.fn(),
	});

	Object.defineProperty(window.HTMLElement.prototype, "releasePointerCapture", {
		writable: true,
		value: vi.fn(),
	});
});

afterEach(() => {
	cleanup();
	window.localStorage.clear();
	document.documentElement.className = "";
	document.documentElement.removeAttribute("data-theme");
	document.documentElement.style.colorScheme = "";
	vi.restoreAllMocks();
	vi.unstubAllEnvs();
	vi.unstubAllGlobals();
});
