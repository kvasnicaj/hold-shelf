import type { VariantProps } from "class-variance-authority";
import { Plus } from "lucide-react";
import { useState } from "react";
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
import { Label } from "#/components/ui/label";

type AddArticleDialogProps = {
	onAdd: (url: string) => Promise<void>;
	triggerVariant?: VariantProps<typeof buttonVariants>["variant"];
	triggerSize?: VariantProps<typeof buttonVariants>["size"];
	triggerClassName?: string;
	triggerAriaLabel?: string;
	collapseLabelOnMobile?: boolean;
};

export function AddArticleDialog({
	onAdd,
	triggerVariant = "outline",
	triggerSize = "sm",
	triggerClassName,
	triggerAriaLabel,
	collapseLabelOnMobile = false,
}: AddArticleDialogProps) {
	const [open, setOpen] = useState(false);
	const [url, setUrl] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError("");

		try {
			new URL(url);
		} catch {
			setError("Please enter a valid URL");
			return;
		}

		setLoading(true);
		try {
			await onAdd(url);
			setUrl("");
			setOpen(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to save article");
		} finally {
			setLoading(false);
		}
	}

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant={triggerVariant}
					size={triggerSize}
					className={triggerClassName}
					aria-label={triggerAriaLabel}
				>
					<Plus className="h-4 w-4" />
					<span className={collapseLabelOnMobile ? "hidden sm:inline" : ""}>
						Add article
					</span>
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Save article</DialogTitle>
					<DialogDescription>
						Paste a URL to save an article to your library.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="article-url">URL</Label>
						<Input
							id="article-url"
							type="url"
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							placeholder="https://example.com/article"
							required
							autoFocus
						/>
					</div>
					{error && <p className="text-sm text-destructive">{error}</p>}
					<Button type="submit" className="w-full" disabled={loading}>
						{loading ? "Saving..." : "Save"}
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
