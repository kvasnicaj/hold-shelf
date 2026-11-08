import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInNewContext } from "node:vm";

const source = await readFile(new URL("./background.js", import.meta.url), "utf8");

function loadExtension({ status = 200, payload = {}, fetchError } = {}) {
	const feedback = [];
	const timers = new Map();
	let nextTimer = 0;
	const logs = [];
	const openedTabs = [];
	let onClick;
	let requestCount = 0;
	const noop = () => {};
	const log = (...args) => logs.push(args);
	runInNewContext(source, {
		URL,
		console: { debug: log, warn: log, error: log },
		setTimeout: (callback) => {
			nextTimer++;
			timers.set(nextTimer, callback);
			return nextTimer;
		},
		clearTimeout: (id) => timers.delete(id),
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
				setBadgeText: ({ text }) => feedback.push({ badge: text }),
				setTitle: ({ title }) => Object.assign(feedback.at(-1), { title }),
			},
			tabs: { create: async (tab) => openedTabs.push(tab) },
		},
	});
	return {
		click: (url = "https://example.com/article") => onClick({ id: 1, url }),
		feedback,
		runTimers: () => {
			for (const [id, callback] of [...timers]) {
				timers.delete(id);
				callback();
			}
		},
		logs,
		openedTabs,
		requestCount: () => requestCount,
	};
}

test("a saved article receives success feedback", async () => {
	const extension = loadExtension();
	await extension.click();
	assert.deepEqual(extension.feedback, [
		{ badge: "OK", title: "Saved to Hold Shelf." },
	]);
});

test("an existing article receives repeat-save success feedback", async () => {
	const extension = loadExtension({
		status: 409,
		payload: { code: "ARTICLE_EXISTS" },
	});
	await extension.click();
	assert.deepEqual(extension.feedback, [
		{ badge: "OK", title: "This article is already in your library." },
	]);
});

test("a storage conflict reports the server explanation as an error", async () => {
	const extension = loadExtension({
		status: 409,
		payload: { code: "QUOTA_EXCEEDED", message: "Your library is full." },
	});
	await extension.click();
	assert.deepEqual(extension.feedback, [
		{ badge: "!", title: "Your library is full." },
	]);
});

test("an unknown conflict is not reported as saved", async () => {
	const extension = loadExtension({ status: 409 });
	await extension.click();
	assert.equal(extension.feedback[0].badge, "!");
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
	assert.equal(extension.feedback[0].badge, "!");
});

test("a network failure produces error feedback", async () => {
	const extension = loadExtension({ fetchError: new Error("Offline") });
	await extension.click();
	assert.deepEqual(extension.feedback, [
		{ badge: "!", title: "Could not reach Hold Shelf." },
	]);
});

test("save diagnostics never log the saved URL or server response", async () => {
	for (const options of [
		{ status: 200, payload: { article: { url: "https://example.com/private" } } },
		{ status: 401, payload: { loginUrl: "https://hold-shelf.com/save?url=x" } },
		{ fetchError: new Error("Offline") },
	]) {
		const extension = loadExtension(options);
		await extension.click("https://example.com/private?token=secret");
		const logged = JSON.stringify(extension.logs);
		assert.doesNotMatch(logged, /example\.com|secret|loginUrl|article/);
	}
});

test("a newer save keeps its feedback until its own reset", async () => {
	const extension = loadExtension();
	await extension.click();
	await extension.click();
	extension.runTimers();
	assert.deepEqual(extension.feedback, [
		{ badge: "OK", title: "Saved to Hold Shelf." },
		{ badge: "OK", title: "Saved to Hold Shelf." },
		{ badge: "", title: "Save to Hold Shelf" },
	]);
});
