import { PencilSimple, Trash } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { ActionsMenu } from "#/components/layout/actions-menu";
import { DropdownMenuItem } from "#/components/ui/dropdown-menu";
import { Input } from "#/components/ui/input";
import { cn } from "#/lib/utils";

type TagItemProps = {
	tag: { id: string; name: string; articleCount: number };
	isActive: boolean;
	onSelect: () => void;
	onRename: (id: string, name: string) => Promise<void>;
	onDelete: (id: string) => Promise<void>;
};

/** One row of the phone tag list: open the tag, or rename or delete it from its menu. */
export function TagItem({
	tag,
	isActive,
	onSelect,
	onRename,
	onDelete,
}: TagItemProps) {
	const [editing, setEditing] = useState(false);
	const [name, setName] = useState(tag.name);
	const [error, setError] = useState("");
	// Submit and blur both save; only one rename may be in flight.
	const saving = useRef(false);

	function stopEditing() {
		setName(tag.name);
		setError("");
		setEditing(false);
	}

	async function handleSave() {
		if (saving.current) return;
		const nextName = name.trim();
		if (!nextName || nextName === tag.name) {
			stopEditing();
			return;
		}
		saving.current = true;
		setError("");
		try {
			await onRename(tag.id, nextName);
			setEditing(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to rename tag.");
		} finally {
			saving.current = false;
		}
	}

	if (editing) {
		return (
			<form
				className="py-1.5"
				onSubmit={(event) => {
					event.preventDefault();
					void handleSave();
				}}
			>
				<Input
					value={name}
					aria-label={`New name for ${tag.name}`}
					aria-invalid={Boolean(error)}
					aria-describedby={error ? `tag-rename-error-${tag.id}` : undefined}
					onChange={(event) => setName(event.target.value)}
					className="h-10 text-sm"
					autoFocus
					onBlur={() => void handleSave()}
					onKeyDown={(event) => {
						if (event.key === "Escape") stopEditing();
					}}
				/>
				{error ? (
					<p
						id={`tag-rename-error-${tag.id}`}
						role="alert"
						className="pt-1 text-sm text-destructive"
					>
						{error}
					</p>
				) : null}
			</form>
		);
	}

	return (
		<div
			className={cn(
				"flex min-h-12 items-center gap-2 text-sm",
				isActive && "bg-select",
			)}
		>
			<button
				type="button"
				onClick={onSelect}
				className="flex min-h-12 min-w-0 flex-1 items-center justify-between gap-3 py-2 pl-1 text-left"
			>
				<span className="truncate font-medium">{tag.name}</span>
				<span className="shrink-0 text-xs tabular-nums text-muted-foreground">
					<span className="sr-only">, </span>
					{tag.articleCount}
					<span className="sr-only">
						{tag.articleCount === 1 ? " article" : " articles"}
					</span>
				</span>
			</button>
			<ActionsMenu
				label={`Actions for ${tag.name}`}
				triggerSize="icon-touch"
				triggerClassName="text-muted-foreground"
			>
				<DropdownMenuItem
					onSelect={() => {
						setError("");
						setEditing(true);
					}}
				>
					<PencilSimple />
					Rename
				</DropdownMenuItem>
				<DropdownMenuItem
					variant="destructive"
					onSelect={() => void onDelete(tag.id)}
				>
					<Trash />
					Delete tag
				</DropdownMenuItem>
			</ActionsMenu>
		</div>
	);
}
