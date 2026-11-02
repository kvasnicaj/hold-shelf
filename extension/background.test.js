import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

const source = await readFile(new URL("./background.js", import.meta.url), "utf8");

function loadExtension({ status = 200, payload = {}, fetchError } = {}) {
	const feedback = [];
	const openedTabs = [];
	let onClick;
	let requestCount = 0;
	const noop = () => {};
	runInNewContext(source, {
		URL,
		console: { debug: noop, warn: noop, error: noop },
		setTimeout: noop,
		fetch: async () => {
			requestCount++;
			if (fetchError) throw fetchError;
			return { status, json: async () => payload };
		},
		chrome: {
			runtime: { onInstalled: { addListener: noop } },
			contextMenus: { onClicked: { addListener: noop } },
			action: {
				onClicked: { addListener: (handler) => (onClick = handler) },
				setBadgeBackgroundColor: noop,
				setBadgeText: noop,
				setTitle: noop,
			},
			scripting: {
				executeScript: async ({ args }) => feedback.push([...args]),
			},
			tabs: { create: async (tab) => openedTabs.push(tab) },
		},
	});
	return {
		click: (url = "https://example.com/article") => onClick({ id: 1, url }),
		feedback,
		openedTabs,
		requestCount: () => requestCount,
	};
}

test("a saved article receives success feedback", async () => {
	const extension = loadExtension();
	await extension.click();
	assert.equal(extension.feedback[0][0], "Saved to Hold Shelf.");
	assert.equal(extension.feedback[0][1], "success");
});

test("an existing article receives repeat-save success feedback", async () => {
	const extension = loadExtension({
		status: 409,
		payload: { code: "ARTICLE_EXISTS" },
	});
	await extension.click();
	assert.equal(extension.feedback[0][0], "Already saved in Hold Shelf.");
	assert.equal(extension.feedback[0][1], "success");
});

test("a storage conflict reports the server explanation as an error", async () => {
	const extension = loadExtension({
		status: 409,
		payload: { code: "QUOTA_EXCEEDED", message: "Your library is full." },
	});
	await extension.click();
	assert.equal(extension.feedback[0][0], "Your library is full.");
	assert.equal(extension.feedback[0][1], "error");
});

test("an unknown conflict is not reported as saved", async () => {
	const extension = loadExtension({ status: 409 });
	await extension.click();
	assert.equal(extension.feedback[0][1], "error");
});

test("a signed-out save falls back to the current save page", async () => {
	const extension = loadExtension({ status: 401 });
	await extension.click();
	const handoff = new URL(extension.openedTabs[0].url);
	assert.equal(handoff.origin, "https://hold-shelf.com");
	assert.equal(handoff.pathname, "/save");
	assert.equal(handoff.searchParams.get("url"), "https://example.com/article");
	assert.equal(extension.feedback.length, 0);
});

test("unsupported browser pages are rejected without a save request", async () => {
	const extension = loadExtension();
	await extension.click("chrome://extensions");
	assert.equal(extension.requestCount(), 0);
	assert.equal(extension.feedback[0][1], "error");
});

test("a network failure produces error feedback", async () => {
	const extension = loadExtension({ fetchError: new Error("Offline") });
	await extension.click();
	assert.equal(extension.feedback[0][0], "Could not reach Hold Shelf.");
	assert.equal(extension.feedback[0][1], "error");
});
