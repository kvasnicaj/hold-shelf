import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";

type TagItemProps = {
	tag: { id: string; name: string; articleCount: number };
	isActive: boolean;
	mobile?: boolean;
	onSelect: () => void;
	onRename: (id: string, name: string) => Promise<void>;
	onDelete: (id: string) => Promise<void>;
};

export function TagItem({
	tag,
	isActive,
	mobile = false,
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
				className={mobile ? "px-0" : "flex items-center gap-1 px-2 py-1"}
				onSubmit={(event) => {
					event.preventDefault();
					void handleSave();
				}}
			>
				<Input
					value={name}
					onChange={(event) => setName(event.target.value)}
					className={mobile ? "h-10 text-sm" : "h-7 text-sm"}
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
			className={
				mobile
					? `group/tag flex w-full items-center justify-between rounded-xl border bg-card px-3 py-3 text-left text-sm shadow-sm transition-colors ${
							isActive
								? "border-accent bg-accent/60 text-accent-foreground"
								: "text-foreground hover:bg-accent/40"
						}`
					: `group/tag flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
							isActive
								? "bg-accent text-accent-foreground"
								: "text-foreground hover:bg-accent/50"
						}`
			}
		>
			<button
				type="button"
				onClick={onSelect}
				className="min-w-0 flex-1 text-left"
			>
				<span className="block truncate font-medium">{tag.name}</span>
			</button>
			<div className="flex items-center gap-1.5">
				<Badge
					variant={mobile ? "secondary" : "outline"}
					className="px-1.5 py-0 text-[10px]"
				>
					{tag.articleCount}
				</Badge>
				<div
					className={
						mobile
							? "flex items-center gap-0.5"
							: "flex items-center gap-0.5 opacity-0 group-hover/tag:opacity-100"
					}
				>
					<Button
						type="button"
						variant="ghost"
						size="icon-xs"
						onClick={(event) => {
							event.stopPropagation();
							setEditing(true);
						}}
						title="Rename"
						aria-label={`Rename ${tag.name}`}
					>
						<Pencil className="h-3.5 w-3.5" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="icon-xs"
						onClick={(event) => {
							event.stopPropagation();
							void onDelete(tag.id);
						}}
						title="Delete"
						aria-label={`Delete ${tag.name}`}
					>
						<Trash2 className="h-3.5 w-3.5" />
					</Button>
				</div>
			</div>
		</div>
	);
}
