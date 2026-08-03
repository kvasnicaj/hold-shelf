import { useState } from "react";
import { buildTagShareUrl } from "#/components/tags/helpers";
import type { TagShare } from "#/components/tags/types";
import {
	createTagShare,
	getTagShare,
	revokeTagShare,
} from "#/server/tag-shares";

export function useTagShare(
	tagId: string,
	initialShare: TagShare | null,
	onShareChange: (share: TagShare | null) => void,
) {
	const [share, setShare] = useState<TagShare | null>(initialShare);
	const [loading, setLoading] = useState(false);
	const [copying, setCopying] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [status, setStatus] = useState<string | null>(null);

	const origin =
		typeof window === "undefined" ? undefined : window.location.origin;
	const shareUrl = share ? buildTagShareUrl(share.token, origin) : null;

	async function loadShare() {
		setLoading(true);
		setError(null);
		setStatus(null);
		try {
			updateShare(await getTagShare({ data: { tagId } }));
		} catch (err) {
			setError(getErrorMessage(err, "Failed to load sharing settings."));
		} finally {
			setLoading(false);
		}
	}

	async function createShare() {
		setLoading(true);
		setError(null);
		setStatus(null);
		try {
			updateShare(await createTagShare({ data: { tagId } }));
			setStatus("Sharing link created.");
		} catch (err) {
			setError(getErrorMessage(err, "Failed to create sharing link."));
		} finally {
			setLoading(false);
		}
	}

	async function revokeShare() {
		setLoading(true);
		setError(null);
		setStatus(null);
		try {
			await revokeTagShare({ data: { tagId } });
			updateShare(null);
			setStatus("Sharing stopped. The old link no longer works.");
		} catch (err) {
			setError(getErrorMessage(err, "Failed to stop sharing."));
		} finally {
			setLoading(false);
		}
	}

	function updateShare(nextShare: TagShare | null) {
		setShare(nextShare);
		onShareChange(nextShare);
	}

	async function copyShareUrl() {
		if (!shareUrl) {
			return;
		}

		setCopying(true);
		setError(null);
		setStatus(null);
		try {
			await navigator.clipboard.writeText(shareUrl);
			setStatus("Sharing link copied.");
		} catch (err) {
			setError(getErrorMessage(err, "Failed to copy sharing link."));
		} finally {
			setCopying(false);
		}
	}

	return {
		share,
		shareUrl,
		loading,
		copying,
		error,
		status,
		loadShare,
		createShare,
		revokeShare,
		copyShareUrl,
	};
}

function getErrorMessage(error: unknown, fallback: string) {
	return error instanceof Error ? error.message : fallback;
}
