import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { tagListOptions } from "#/components/articles/query-options";
import { useOpenArticle } from "#/components/articles/use-open-article";
import { useSaveArticle } from "#/components/articles/use-save-article";
import { QuickSaveForm } from "#/components/quick-save/quick-save-form";
import type { QuickSaveMode } from "#/components/quick-save/types";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTitle,
} from "#/components/ui/sheet";
import { useIsMobile } from "#/hooks/use-mobile";

type QuickSaveDialogProps = {
	open: boolean;
	initialUrl?: string;
	onOpenChange: (open: boolean) => void;
};

const description = "Paste a link to save it to Unread.";

export function QuickSaveDialog({
	open,
	initialUrl,
	onOpenChange,
}: QuickSaveDialogProps) {
	const isMobile = useIsMobile();
	const { handleAdd } = useSaveArticle();
	const { handleOpenArticle } = useOpenArticle();
	const { data: tags = [] } = useQuery({ ...tagListOptions(), enabled: open });

	async function handleSubmit(
		url: string,
		tagIds: string[],
		mode: QuickSaveMode,
	) {
		const article = await handleAdd(url, tagIds);
		onOpenChange(false);
		if (mode === "read") {
			await handleOpenArticle(article.id, false);
			return;
		}
		toast.success("Saved to Unread", {
			action: {
				label: "Read now",
				onClick: () => void handleOpenArticle(article.id, false),
			},
		});
	}

	const form = (
		<QuickSaveForm
			initialUrl={initialUrl}
			tags={tags}
			onSubmit={handleSubmit}
			variant={isMobile ? "sheet" : "panel"}
		/>
	);

	if (isMobile) {
		return (
			<Sheet open={open} onOpenChange={onOpenChange}>
				<SheetContent
					side="bottom"
					className="gap-0 rounded-t-2xl bg-card px-4 pt-5 pb-[calc(env(safe-area-inset-bottom)+1rem)]"
				>
					<SheetTitle className="mb-1 font-serif text-xl font-semibold">
						Save a link
					</SheetTitle>
					<SheetDescription className="sr-only">{description}</SheetDescription>
					{form}
				</SheetContent>
			</Sheet>
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				showCloseButton={false}
				className="top-[14vh] translate-y-0 gap-0 overflow-hidden rounded-xl bg-card p-0 shadow-float sm:max-w-xl"
			>
				<DialogTitle className="sr-only">Save a link</DialogTitle>
				<DialogDescription className="sr-only">{description}</DialogDescription>
				{form}
			</DialogContent>
		</Dialog>
	);
}
