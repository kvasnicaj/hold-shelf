import { Bookmark } from "lucide-react";

export function AppBrandMark() {
	return (
		<div className="flex h-10 w-10 items-center justify-center rounded-lg md:hidden">
			<Bookmark className="h-8 w-8 text-(--lagoon)" />
			<span className="sr-only">Hold Shelf</span>
		</div>
	);
}
