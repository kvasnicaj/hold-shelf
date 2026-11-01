import { DotsThreeVertical, Tag as TagIcon } from "@phosphor-icons/react";
import type { VariantProps } from "class-variance-authority";
import { type ReactNode, useRef } from "react";
import { NO_TAG_PICKER } from "#/components/tags/helpers";
import { TagPickerPanel } from "#/components/tags/tag-picker-panel";
import {
	type TagPickerOptions,
	useTagPicker,
} from "#/components/tags/use-tag-picker";
import { Button, type buttonVariants } from "#/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { Popover, PopoverAnchor } from "#/components/ui/popover";

type ActionsMenuProps = {
	/** Accessible name of the trigger, e.g. "More actions for <title>". */
	label: string;
	triggerSize?: VariantProps<typeof buttonVariants>["size"];
	triggerClassName?: string;
	align?: "start" | "end";
	/** Labeled menu items. */
	children: ReactNode;
	/** Items set apart after a separator, such as Move to Trash. */
	footer?: ReactNode;
	/** Adds a Tags… item that opens the tag picker next to the trigger. */
	tagPicker?: TagPickerOptions;
};

/**
 * A vertical menu of labeled actions behind one "more" button. Secondary
 * actions live here so rows and toolbars keep only their primary action.
 */
export function ActionsMenu({
	label,
	triggerSize = "icon-xs",
	triggerClassName,
	align = "end",
	children,
	footer,
	tagPicker,
}: ActionsMenuProps) {
	const picker = useTagPicker(tagPicker ?? NO_TAG_PICKER);
	// The picker opens once the menu has closed and handed focus back.
	const openTagsAfterClose = useRef(false);

	return (
		<Popover open={picker.open} onOpenChange={picker.changeOpen}>
			<DropdownMenu>
				<PopoverAnchor asChild>
					<DropdownMenuTrigger asChild>
						<Button
							type="button"
							variant="ghost"
							size={triggerSize}
							aria-label={label}
							title="More actions"
							className={triggerClassName}
							onClick={(event) => event.stopPropagation()}
							onKeyDown={(event) => event.stopPropagation()}
						>
							<DotsThreeVertical className="size-[1.125rem]" />
						</Button>
					</DropdownMenuTrigger>
				</PopoverAnchor>
				<DropdownMenuContent
					align={align}
					className="min-w-52"
					onClick={(event) => event.stopPropagation()}
					onCloseAutoFocus={(event) => {
						if (!openTagsAfterClose.current) return;
						event.preventDefault();
						openTagsAfterClose.current = false;
						picker.changeOpen(true);
					}}
				>
					{children}
					{tagPicker && (
						<DropdownMenuItem
							onSelect={() => {
								openTagsAfterClose.current = true;
							}}
						>
							<TagIcon />
							Tags…
						</DropdownMenuItem>
					)}
					{footer && (
						<>
							<DropdownMenuSeparator />
							{footer}
						</>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
			{tagPicker && (
				<TagPickerPanel picker={picker} title="Article tags" align={align} />
			)}
		</Popover>
	);
}
