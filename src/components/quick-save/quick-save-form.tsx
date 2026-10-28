import { ClipboardText, LinkSimple } from "@phosphor-icons/react";
import { useState } from "react";
import { getDisplayHost, toHttpUrl } from "#/components/quick-save/helpers";
import type { QuickSaveMode } from "#/components/quick-save/types";
import { TagChip } from "#/components/tags/tag-chip";
import type { Tag } from "#/components/tags/types";
import { Button } from "#/components/ui/button";
import { cn } from "#/lib/utils";

type QuickSaveFormProps = {
	initialUrl?: string;
	tags: Tag[];
	onSubmit: (
		url: string,
		tagIds: string[],
		mode: QuickSaveMode,
	) => Promise<void>;
	/** Sheet layout for phones: larger buttons and a paste action. */
	variant?: "panel" | "sheet";
};

export function QuickSaveForm({
	initialUrl = "",
	tags,
	onSubmit,
	variant = "panel",
}: QuickSaveFormProps) {
	const [value, setValue] = useState(initialUrl);
	const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
	const [error, setError] = useState("");
	const [saving, setSaving] = useState<QuickSaveMode | null>(null);
	const url = toHttpUrl(value);
	const canPaste =
		variant === "sheet" &&
		typeof navigator !== "undefined" &&
		Boolean(navigator.clipboard?.readText);

	async function submit(mode: QuickSaveMode) {
		if (saving) return;
		if (!url) {
			setError(
				value.trim()
					? "That doesn't look like a link yet. Links start with https://"
					: "Paste a link to save it.",
			);
			return;
		}
		setError("");
		setSaving(mode);
		try {
			await onSubmit(url, selectedTagIds, mode);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "The link could not be saved.",
			);
			setSaving(null);
		}
	}

	async function pasteFromClipboard() {
		try {
			const text = await navigator.clipboard.readText();
			setValue(text.trim());
			setError(toHttpUrl(text) ? "" : "The clipboard doesn't hold a link.");
		} catch {
			setError("Hold Shelf couldn't read the clipboard. Paste into the field.");
		}
	}

	function toggleTag(tagId: string) {
		setSelectedTagIds((current) =>
			current.includes(tagId)
				? current.filter((id) => id !== tagId)
				: [...current, tagId],
		);
	}

	return (
		<form
			noValidate
			onSubmit={(event) => {
				event.preventDefault();
				void submit("save");
			}}
		>
			<label
				htmlFor="quick-save-url"
				className={cn(
					"flex items-center gap-3",
					variant === "panel"
						? "px-5 py-4"
						: "h-12 rounded-lg border border-input bg-background px-3.5",
				)}
			>
				<LinkSimple className="size-5 shrink-0 text-mark" />
				<span className="sr-only">Link</span>
				<input
					id="quick-save-url"
					type="url"
					inputMode="url"
					autoComplete="off"
					placeholder="Paste a link to save"
					value={value}
					onChange={(event) => {
						setValue(event.target.value);
						setError("");
					}}
					onKeyDown={(event) => {
						if (event.key === "Enter" && event.shiftKey) {
							event.preventDefault();
							void submit("read");
						}
					}}
					aria-invalid={Boolean(error)}
					aria-describedby="quick-save-status"
					className={cn(
						"min-w-0 flex-1 bg-transparent outline-none placeholder:text-faint-foreground",
						variant === "panel"
							? "text-lg font-medium"
							: "text-base font-medium",
					)}
				/>
			</label>

			<div
				className={cn(
					"space-y-3",
					variant === "panel" ? "border-t px-5 py-3.5" : "pt-3",
				)}
			>
				<p
					id="quick-save-status"
					aria-live="polite"
					className={cn(
						"text-sm",
						error ? "text-destructive" : "text-muted-foreground",
					)}
				>
					{error ||
						(url
							? `${getDisplayHost(url)} · Saves to Unread`
							: "Hold Shelf saves the article and its text for reading later.")}
				</p>

				{tags.length > 0 && (
					<fieldset className="flex gap-1.5 overflow-x-auto [scrollbar-width:none]">
						<legend className="sr-only">Tags</legend>
						{tags.map((tag) => (
							<TagChip
								key={tag.id}
								isActive={selectedTagIds.includes(tag.id)}
								onClick={() => toggleTag(tag.id)}
							>
								{tag.name}
							</TagChip>
						))}
					</fieldset>
				)}

				{canPaste && !value && (
					<Button
						type="button"
						variant="secondary"
						className="h-11 w-full"
						onClick={() => void pasteFromClipboard()}
					>
						<ClipboardText />
						Paste from clipboard
					</Button>
				)}
			</div>

			<div
				className={cn(
					"flex items-center gap-2",
					variant === "panel"
						? "border-t bg-background px-5 py-2.5"
						: "flex-col-reverse pt-4",
				)}
			>
				{variant === "panel" && (
					<p className="mr-auto hidden items-center gap-3 text-xs text-muted-foreground sm:flex">
						<span>
							<kbd>↵</kbd> Save
						</span>
						<span>
							<kbd>⇧</kbd>
							<kbd>↵</kbd> Save and read
						</span>
						<span>
							<kbd>Esc</kbd> Close
						</span>
					</p>
				)}
				<Button
					type="button"
					variant="ghost"
					disabled={Boolean(saving)}
					className={cn(variant === "sheet" && "h-11 w-full")}
					onClick={() => void submit("read")}
				>
					{saving === "read" ? "Saving..." : "Save and read"}
				</Button>
				<Button
					type="submit"
					disabled={Boolean(saving)}
					className={cn(variant === "sheet" && "h-11 w-full")}
				>
					{saving === "save" ? "Saving..." : "Save"}
				</Button>
			</div>
		</form>
	);
}
