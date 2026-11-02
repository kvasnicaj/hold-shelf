const APP_ORIGIN = "https://hold-shelf.com";
const SUCCESS_BADGE_COLOR = "#23767e";
const ERROR_BADGE_COLOR = "#b03f2c";
// Standalone extension equivalents of the shared design-language tokens.
const TOAST_THEME = {
	background: "#173a40",
	foreground: "#d7ece8",
	errorBackground: "#b03f2c",
	errorForeground: "#fbfcf9",
	border: "#2f565d",
	shadow: "0 8px 24px rgb(13 31 35 / 18%)",
};

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
	console.debug("Hold Shelf save requested", { tabId, url });

	if (!isHttpUrl(url)) {
		console.warn("Hold Shelf save skipped: invalid tab URL", { tabId, url });
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
		console.debug("Hold Shelf save response", {
			status: response.status,
			payload,
			url,
		});

		if (response.status === 200) {
			await showToast(tabId, "Saved to Hold Shelf.", "success");
			await showBadge(tabId, "OK", SUCCESS_BADGE_COLOR, "Saved to Hold Shelf.");
			return;
		}

		if (response.status === 409 && payload.code === "ARTICLE_EXISTS") {
			await showToast(tabId, "Already saved in Hold Shelf.", "success");
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
			console.debug("Hold Shelf opening login handoff", { loginUrl, url });
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
		console.error("Hold Shelf save request failed", { url });
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

	setTimeout(() => {
		void chrome.action.setBadgeText({ tabId, text: "" });
		void chrome.action.setTitle({ tabId, title: "Save to Hold Shelf" });
	}, 4000);
}

async function showErrorFeedback(tabId, message) {
	await showBadge(tabId, "!", ERROR_BADGE_COLOR, message);
	await showToast(tabId, message, "error");
}

function getExtensionSaveUrl(url) {
	const loginUrl = new URL("/save", APP_ORIGIN);
	loginUrl.searchParams.set("url", url);
	return loginUrl.toString();
}

async function showToast(tabId, message, kind) {
	if (typeof tabId !== "number") {
		return;
	}

	try {
		await chrome.scripting.executeScript({
			target: { tabId },
			func: (toastMessage, toastKind, theme) => {
				const existing = document.getElementById("hold-shelf-extension-toast");
				if (existing) {
					existing.remove();
				}

				const toast = document.createElement("div");
				toast.id = "hold-shelf-extension-toast";
				toast.textContent = toastMessage;
				toast.setAttribute("role", toastKind === "error" ? "alert" : "status");
				toast.style.position = "fixed";
				toast.style.top = "20px";
				toast.style.right = "20px";
				toast.style.zIndex = "2147483647";
				toast.style.maxWidth = "320px";
				toast.style.padding = "12px 14px";
				toast.style.borderRadius = "8px";
				toast.style.background =
					toastKind === "success" ? theme.background : theme.errorBackground;
				toast.style.color =
					toastKind === "success" ? theme.foreground : theme.errorForeground;
				toast.style.boxShadow = theme.shadow;
				toast.style.fontFamily =
					'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
				toast.style.fontSize = "14px";
				toast.style.lineHeight = "22px";
				toast.style.border = `1px solid ${toastKind === "success" ? theme.border : theme.errorBackground}`;
				toast.style.opacity = "0";
				toast.style.transform = "translateY(-8px)";
				toast.style.transition = window.matchMedia(
					"(prefers-reduced-motion: reduce)",
				).matches
					? "none"
					: "opacity 180ms ease-out, transform 180ms ease-out";

				document.documentElement.appendChild(toast);

				requestAnimationFrame(() => {
					toast.style.opacity = "1";
					toast.style.transform = "translateY(0)";
				});

				window.setTimeout(() => {
					toast.style.opacity = "0";
					toast.style.transform = "translateY(-8px)";
					window.setTimeout(() => toast.remove(), 180);
				}, 2400);
			},
			args: [message, kind, TOAST_THEME],
		});
	} catch (error) {
		console.warn("Hold Shelf toast injection failed", { tabId, error });
	}
}
