import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Input } from "#/components/ui/input";

type TagItemProps = {
	tag: { id: string; name: string; articleCount: number };
	isActive: boolean;
	onSelect: () => void;
	onRename: (id: string, name: string) => Promise<void>;
	onDelete: (id: string) => Promise<void>;
};

export function TagItem({
	tag,
	isActive,
	onSelect,
	onRename,
	onDelete,
}: TagItemProps) {
	const [editing, setEditing] = useState(false);
	const [name, setName] = useState(tag.name);

	async function handleSave() {
		if (name.trim() && name.trim() !== tag.name) {
			await onRename(tag.id, name.trim());
		}
		setEditing(false);
	}

	if (editing) {
		return (
			<form
				className="flex items-center gap-1 px-2 py-1"
				onSubmit={(event) => {
					event.preventDefault();
					void handleSave();
				}}
			>
				<Input
					value={name}
					onChange={(event) => setName(event.target.value)}
					className="h-7 text-sm"
					autoFocus
					onBlur={() => void handleSave()}
					onKeyDown={(event) => {
						if (event.key === "Escape") {
							setName(tag.name);
							setEditing(false);
						}
					}}
				/>
			</form>
		);
	}

	return (
		<div
			className={`group/tag flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
				isActive
					? "bg-accent text-accent-foreground"
					: "text-foreground hover:bg-accent/50"
			}`}
		>
			<button
				type="button"
				onClick={onSelect}
				className="min-w-0 flex-1 truncate text-left"
			>
				<span className="truncate">{tag.name}</span>
			</button>
			<div className="flex items-center gap-1">
				<span className="text-xs text-muted-foreground">
					{tag.articleCount}
				</span>
				<div className="flex items-center gap-0.5 opacity-0 group-hover/tag:opacity-100">
					<button
						type="button"
						className="rounded p-0.5 hover:bg-foreground/10"
						onClick={(event) => {
							event.stopPropagation();
							setEditing(true);
						}}
						title="Rename"
						aria-label={`Rename ${tag.name}`}
					>
						<Pencil className="h-3 w-3" />
					</button>
					<button
						type="button"
						className="rounded p-0.5 hover:bg-foreground/10"
						onClick={(event) => {
							event.stopPropagation();
							void onDelete(tag.id);
						}}
						title="Delete"
						aria-label={`Delete ${tag.name}`}
					>
						<Trash2 className="h-3 w-3" />
					</button>
				</div>
			</div>
		</div>
	);
}
