import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
import { getContinueReading, getReadingProgress } from "#/server/library";

function ensureLocalStorage() {
	if (window.localStorage) {
		return;
	}

	const storage = new Map<string, string>();

	Object.defineProperty(window, "localStorage", {
		configurable: true,
		value: {
			getItem: vi.fn((key: string) => storage.get(key) ?? null),
			setItem: vi.fn((key: string, value: string) => {
				storage.set(key, value);
			}),
			removeItem: vi.fn((key: string) => {
				storage.delete(key);
			}),
			clear: vi.fn(() => {
				storage.clear();
			}),
		},
	});
}

beforeEach(() => {
	ensureLocalStorage();
	vi.mocked(getContinueReading).mockResolvedValue([]);
	vi.mocked(getReadingProgress).mockResolvedValue(0);

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

vi.mock("#/server/library", () => ({
	permanentlyDeleteTrash: vi.fn(),
	finishReading: vi.fn(),
	restoreArticles: vi.fn().mockResolvedValue({ success: true }),
	getTrash: vi.fn().mockResolvedValue([]),
	getReadingProgress: vi.fn().mockResolvedValue(0),
	saveReadingProgress: vi.fn().mockResolvedValue({ success: true }),
	getContinueReading: vi.fn().mockResolvedValue([]),
	refreshArticleContent: vi.fn(),
	exportLibraryPage: vi.fn().mockResolvedValue([]),
	importLibraryBatch: vi.fn(),
}));
