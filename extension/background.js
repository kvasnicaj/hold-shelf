const APP_ORIGIN = "https://hold-shelf.com";
const SUCCESS_BADGE_COLOR = "#23767e";
const ERROR_BADGE_COLOR = "#b03f2c";
const badgeResetTimers = new Map();

chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		id: "save-page",
		title: "Save page to Hold Shelf",
		contexts: ["page"],
	});

	chrome.contextMenus.create({
		id: "save-link",
		title: "Save link to Hold Shelf",
		contexts: ["link"],
	});
});

chrome.action.onClicked.addListener(async (tab) => {
	await saveUrl(tab.id, tab.url);
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
	const targetUrl = info.menuItemId === "save-link" ? info.linkUrl : tab?.url;
	await saveUrl(tab?.id, targetUrl);
});

async function saveUrl(tabId, url) {
	if (!isHttpUrl(url)) {
		console.warn("Hold Shelf save skipped: unsupported page");
		await showErrorFeedback(tabId, "Hold Shelf can only save http(s) pages.");
		return;
	}

	try {
		const response = await fetch(`${APP_ORIGIN}/api/extension/articles`, {
			method: "POST",
			credentials: "include",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ url }),
		});

		const payload = await response.json().catch(() => ({}));
		console.debug("Hold Shelf save response", { status: response.status });

		if (response.status === 200) {
			await showBadge(tabId, "OK", SUCCESS_BADGE_COLOR, "Saved to Hold Shelf.");
			return;
		}

		if (response.status === 409 && payload.code === "ARTICLE_EXISTS") {
			await showBadge(
				tabId,
				"OK",
				SUCCESS_BADGE_COLOR,
				"This article is already in your library.",
			);
			return;
		}

		if (response.status === 401) {
			const loginUrl =
				typeof payload.loginUrl === "string"
					? payload.loginUrl
					: getExtensionSaveUrl(url);
			await chrome.tabs.create({ url: loginUrl });
			return;
		}

		await showErrorFeedback(
			tabId,
			typeof payload.message === "string"
				? payload.message
				: "Failed to save to Hold Shelf.",
		);
	} catch {
		console.error("Hold Shelf save request failed");
		await showErrorFeedback(tabId, "Could not reach Hold Shelf.");
	}
}

function isHttpUrl(url) {
	if (typeof url !== "string") {
		return false;
	}

	try {
		const parsed = new URL(url);
		return parsed.protocol === "http:" || parsed.protocol === "https:";
	} catch {
		return false;
	}
}

async function showBadge(tabId, text, color, title) {
	if (typeof tabId !== "number") {
		return;
	}

	await chrome.action.setBadgeBackgroundColor({ tabId, color });
	await chrome.action.setBadgeText({ tabId, text });
	await chrome.action.setTitle({ tabId, title });

	// A newer save on the same tab replaces this feedback; its own timer resets it.
	clearTimeout(badgeResetTimers.get(tabId));
	badgeResetTimers.set(
		tabId,
		setTimeout(() => {
			badgeResetTimers.delete(tabId);
			void chrome.action.setBadgeText({ tabId, text: "" });
			void chrome.action.setTitle({ tabId, title: "Save to Hold Shelf" });
		}, 4000),
	);
}

async function showErrorFeedback(tabId, message) {
	await showBadge(tabId, "!", ERROR_BADGE_COLOR, message);
}

function getExtensionSaveUrl(url) {
	const loginUrl = new URL("/save", APP_ORIGIN);
	loginUrl.searchParams.set("url", url);
	return loginUrl.toString();
}
