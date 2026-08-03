import {
	Check,
	Copy,
	ExternalLink,
	LoaderCircle,
	Share2,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import type { TagShare } from "#/components/tags/types";
import { useTagShare } from "#/components/tags/use-tag-share";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";

type ShareTagDialogProps = {
	tagId: string;
	tagName: string;
	initialShare: TagShare | null;
	onShareChange: (share: TagShare | null) => void;
};

export function ShareTagDialog({
	tagId,
	tagName,
	initialShare,
	onShareChange,
}: ShareTagDialogProps) {
	const [open, setOpen] = useState(false);
	const [confirmingRevoke, setConfirmingRevoke] = useState(false);
	const {
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
	} = useTagShare(tagId, initialShare, onShareChange);

	function handleOpenChange(nextOpen: boolean) {
		setOpen(nextOpen);
		setConfirmingRevoke(false);
		if (nextOpen) {
			void loadShare();
		}
	}

	async function handleRevoke() {
		await revokeShare();
		setConfirmingRevoke(false);
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button
					type="button"
					variant="outline"
					data-shared={share ? "true" : "false"}
					size="icon-sm"
					aria-label={`Share ${tagName}`}
					title="Share tag"
				>
					<Share2 className="h-[1.125rem] w-[1.125rem]" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Share {tagName}</DialogTitle>
					<DialogDescription>
						Anyone with the link can see your first name and the current
						articles in this tag. Your other tags and private article state stay
						hidden.
					</DialogDescription>
				</DialogHeader>

				{loading && !share ? (
					<div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
						<LoaderCircle className="size-4 animate-spin" />
						Loading sharing settings...
					</div>
				) : share && shareUrl ? (
					<div className="space-y-4">
						<div className="flex gap-2">
							<Input
								value={shareUrl}
								readOnly
								aria-label={`Sharing link for ${tagName}`}
								className="font-mono text-xs"
							/>
							<Button
								type="button"
								variant="outline"
								disabled={copying || loading}
								onClick={() => void copyShareUrl()}
								aria-label="Copy sharing link"
							>
								<Copy className="size-4" />
							</Button>
						</div>

						{confirmingRevoke ? (
							<div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
								<p className="text-sm">
									Stop sharing this tag? The existing link will stop working
									immediately.
								</p>
								<div className="flex justify-end gap-2">
									<Button
										type="button"
										variant="outline"
										disabled={loading}
										onClick={() => setConfirmingRevoke(false)}
									>
										Cancel
									</Button>
									<Button
										type="button"
										variant="destructive"
										disabled={loading}
										onClick={() => void handleRevoke()}
									>
										<Trash2 className="size-4" />
										Stop sharing
									</Button>
								</div>
							</div>
						) : (
							<DialogFooter>
								<Button
									type="button"
									variant="destructive"
									disabled={loading}
									onClick={() => setConfirmingRevoke(true)}
								>
									Stop sharing
								</Button>
								<Button asChild variant="outline">
									<a href={shareUrl} target="_blank" rel="noopener noreferrer">
										<ExternalLink className="size-4" />
										Open link
									</a>
								</Button>
							</DialogFooter>
						)}
					</div>
				) : (
					<div className="space-y-4">
						<p className="text-sm text-muted-foreground">
							Sharing is off. A public URL will only be created when you choose
							Create link.
						</p>
						<DialogFooter>
							<Button
								type="button"
								disabled={loading}
								onClick={() => void createShare()}
							>
								{loading ? (
									<LoaderCircle className="size-4 animate-spin" />
								) : (
									<Share2 className="size-4" />
								)}
								Create link
							</Button>
						</DialogFooter>
					</div>
				)}

				{status ? (
					<p
						className="flex items-center gap-2 text-sm text-primary"
						aria-live="polite"
					>
						<Check className="size-4" />
						{status}
					</p>
				) : null}
				{error ? (
					<p className="text-sm text-destructive" role="alert">
						{error}
					</p>
				) : null}
			</DialogContent>
		</Dialog>
	);
}
