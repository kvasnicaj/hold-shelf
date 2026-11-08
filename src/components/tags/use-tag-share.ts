import { useState } from "react";
import { buildTagShareUrl } from "#/components/tags/helpers";
import type { SharePending, TagShare } from "#/components/tags/types";
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
	const [pending, setPending] = useState<SharePending>(null);
	const [copying, setCopying] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [status, setStatus] = useState<string | null>(null);

	const origin =
		typeof window === "undefined" ? undefined : window.location.origin;
	const shareUrl = share ? buildTagShareUrl(share.token, origin) : null;

	/** Runs one share request; resolves whether it succeeded. */
	async function run(
		kind: Exclude<SharePending, null>,
		request: () => Promise<TagShare | null>,
		failure: string,
		success?: string,
	) {
		setPending(kind);
		setError(null);
		setStatus(null);
		try {
			updateShare(await request());
			if (success) setStatus(success);
			return true;
		} catch (err) {
			setError(getErrorMessage(err, failure));
			return false;
		} finally {
			setPending(null);
		}
	}

	function loadShare() {
		return run(
			"load",
			() => getTagShare({ data: { tagId } }),
			"Failed to load sharing settings.",
		);
	}

	function createShare() {
		return run(
			"create",
			() => createTagShare({ data: { tagId } }),
			"Failed to create sharing link.",
			"Sharing link created.",
		);
	}

	function revokeShare() {
		return run(
			"revoke",
			async () => {
				await revokeTagShare({ data: { tagId } });
				return null;
			},
			"Failed to stop sharing.",
			"Sharing stopped. The old link no longer works.",
		);
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
		loading: pending !== null,
		/** A create or revoke is in flight and cannot be canceled. */
		mutating: pending === "create" || pending === "revoke",
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
