import { Tag as TagIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { TagPickerPanel } from "#/components/tags/tag-picker-panel";
import {
	type TagPickerOptions,
	useTagPicker,
} from "#/components/tags/use-tag-picker";
import { Button } from "#/components/ui/button";
import { Popover, PopoverTrigger } from "#/components/ui/popover";

type TagPickerProps = TagPickerOptions & {
	triggerClassName?: string;
	/** Replaces the default tag icon button; rendered as the popover trigger. */
	trigger?: ReactNode;
	title?: string;
	align?: "start" | "center" | "end";
};

export function TagPicker({
	triggerClassName,
	trigger,
	title = "Article tags",
	align,
	...props
}: TagPickerProps) {
	const picker = useTagPicker(props);
	return (
		<Popover open={picker.open} onOpenChange={picker.changeOpen}>
			<PopoverTrigger asChild>
				{trigger ?? (
					<Button
						type="button"
						variant="ghost"
						size="icon-xs"
						title="Manage tags"
						aria-label="Manage tags"
						className={triggerClassName}
						onClick={(event) => event.stopPropagation()}
					>
						<TagIcon className="h-[1.125rem] w-[1.125rem]" />
					</Button>
				)}
			</PopoverTrigger>
			<TagPickerPanel picker={picker} title={title} align={align} />
		</Popover>
	);
}
