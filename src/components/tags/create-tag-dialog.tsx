import type { VariantProps } from "class-variance-authority";
import { Plus } from "lucide-react";
import { CreateTagFormFields } from "#/components/tags/create-tag-form-fields";
import { CreatedTagsList } from "#/components/tags/created-tags-list";
import { useCreateTagDialog } from "#/components/tags/use-create-tag-dialog";
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

type CreateTagDialogProps = {
	onCreate: (name: string) => Promise<void>;
	triggerVariant?: VariantProps<typeof buttonVariants>["variant"];
	triggerSize?: VariantProps<typeof buttonVariants>["size"];
	triggerClassName?: string;
	triggerAriaLabel?: string;
	collapseLabelOnMobile?: boolean;
};

export function CreateTagDialog({
	onCreate,
	triggerVariant = "outline",
	triggerSize = "sm",
	triggerClassName,
	triggerAriaLabel,
	collapseLabelOnMobile = false,
}: CreateTagDialogProps) {
	const {
		open,
		name,
		loading,
		error,
		created,
		inputRef,
		setName,
		submit,
		handleOpenChange,
	} = useCreateTagDialog(onCreate);

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button
					variant={triggerVariant}
					size={triggerSize}
					className={triggerClassName}
					aria-label={triggerAriaLabel}
				>
					<Plus className="h-[1.125rem] w-[1.125rem]" />
					<span className={collapseLabelOnMobile ? "hidden sm:inline" : ""}>
						Create tag
					</span>
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Create tag</DialogTitle>
					<DialogDescription>
						Add a new tag to organize your articles.
					</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(event) => {
						event.preventDefault();
						void submit(false);
					}}
					className="space-y-4"
				>
					<CreateTagFormFields
						name={name}
						error={error}
						onNameChange={setName}
						inputRef={inputRef}
					/>
					{error && <p className="text-sm text-destructive">{error}</p>}
					<CreatedTagsList created={created} />
					<div className="flex gap-2">
						<Button type="submit" className="flex-1" disabled={loading}>
							Create
						</Button>
						<Button
							type="button"
							variant="outline"
							className="flex-1"
							disabled={loading}
							onClick={() => void submit(true)}
						>
							Create & add another
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
