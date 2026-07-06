import type { VariantProps } from "class-variance-authority";
import { Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import type { buttonVariants } from "#/components/ui/button";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";

type RenameTagDialogProps = {
	tagName: string;
	onRename: (name: string) => Promise<void>;
	triggerVariant?: VariantProps<typeof buttonVariants>["variant"];
	triggerSize?: VariantProps<typeof buttonVariants>["size"];
	triggerClassName?: string;
	triggerTitle?: string;
	triggerAriaLabel?: string;
};

export function RenameTagDialog({
	tagName,
	onRename,
	triggerVariant = "ghost",
	triggerSize = "icon-sm",
	triggerClassName,
	triggerTitle = "Rename tag",
	triggerAriaLabel = "Rename tag",
}: RenameTagDialogProps) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState(tagName);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!open) {
			setName(tagName);
		}
	}, [open, tagName]);

	async function submit() {
		const nextName = name.trim();
		if (!nextName) return;

		setLoading(true);
		try {
			if (nextName !== tagName) {
				await onRename(nextName);
			}
			setOpen(false);
		} finally {
			setLoading(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					type="button"
					variant={triggerVariant}
					size={triggerSize}
					className={triggerClassName}
					title={triggerTitle}
					aria-label={triggerAriaLabel}
				>
					<Pencil className="h-[1.125rem] w-[1.125rem]" />
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Rename tag</DialogTitle>
					<DialogDescription>
						Update the name shown for this tag.
					</DialogDescription>
				</DialogHeader>
				<form
					className="space-y-4"
					onSubmit={(event) => {
						event.preventDefault();
						void submit();
					}}
				>
					<Input
						value={name}
						onChange={(event) => setName(event.target.value)}
						aria-label="Tag name"
						autoFocus
					/>
					<div className="flex justify-end gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={loading}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={loading || !name.trim()}>
							Save
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
