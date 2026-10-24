import { useEffect, useState } from "react";
import type { Tag } from "#/components/tags/types";

type UseTagPickerOptions = {
	availableTags: Tag[];
	selectedTagIds: string[];
	articleIds: string[];
	onAddTag: (tagId: string, articleIds: string[]) => void | Promise<void>;
	onRemoveTag: (tagId: string, articleIds: string[]) => void | Promise<void>;
	onCreateTag: (name: string) => Promise<Tag>;
};

export function useTagPicker({
	availableTags,
	selectedTagIds,
	articleIds,
	onAddTag,
	onRemoveTag,
	onCreateTag,
}: UseTagPickerOptions) {
	const [open, setOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [pending, setPending] = useState<string | null>(null);
	const [creating, setCreating] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [createdTags, setCreatedTags] = useState<Tag[]>([]);
	const [changes, setChanges] = useState<Record<string, boolean>>({});
	const tags = [
		...availableTags,
		...createdTags.filter(
			(tag) => !availableTags.some((existing) => existing.id === tag.id),
		),
	];
	const selectedIds = tags
		.filter((tag) => changes[tag.id] ?? selectedTagIds.includes(tag.id))
		.map((tag) => tag.id);
	const query = search.trim();
	const filteredTags = tags.filter((tag) =>
		tag.name.toLowerCase().includes(query.toLowerCase()),
	);
	const canCreate =
		!!query &&
		!tags.some((tag) => tag.name.toLowerCase() === query.toLowerCase());
	const busy = creating || pending !== null;

	useEffect(() => {
		setChanges((previous) => {
			const remaining = Object.fromEntries(
				Object.entries(previous).filter(
					([id, selected]) => selected !== selectedTagIds.includes(id),
				),
			);
			return Object.keys(remaining).length === Object.keys(previous).length
				? previous
				: remaining;
		});
	}, [selectedTagIds]);

	async function updateTag(tagId: string, selected: boolean) {
		setPending(tagId);
		setError(null);
		setChanges((previous) => ({ ...previous, [tagId]: selected }));
		try {
			await (selected ? onAddTag : onRemoveTag)(tagId, articleIds);
			return true;
		} catch (error) {
			setChanges((previous) => ({ ...previous, [tagId]: !selected }));
			setError(
				error instanceof Error ? error.message : "Could not update tag.",
			);
			return false;
		} finally {
			setPending(null);
		}
	}

	async function toggleTag(tagId: string) {
		if (busy) return;
		await updateTag(tagId, !selectedIds.includes(tagId));
	}

	async function createAndAssignTag() {
		if (busy || !canCreate) return;
		setCreating(true);
		setError(null);
		try {
			const tag = await onCreateTag(query);
			setCreatedTags((previous) => [...previous, tag]);
			if (await updateTag(tag.id, true)) setSearch("");
		} catch (error) {
			setError(
				error instanceof Error
					? error.message
					: "Could not create tag. Please try again.",
			);
		} finally {
			setCreating(false);
		}
	}

	function changeOpen(nextOpen: boolean) {
		setOpen(nextOpen);
		if (!nextOpen) {
			setSearch("");
			setError(null);
		}
	}

	return {
		open,
		changeOpen,
		search,
		setSearch,
		filteredTags,
		selectedIds,
		pending,
		creating,
		busy,
		error,
		canCreate,
		toggleTag,
		createAndAssignTag,
	};
}
