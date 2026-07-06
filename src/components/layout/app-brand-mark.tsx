import { Bookmark } from "lucide-react";

export function AppBrandMark() {
	return (
		<div className="flex h-9 w-9 items-center justify-center md:hidden">
			<Bookmark className="h-7 w-7 text-(--lagoon)" />
			<span className="sr-only">Hold Shelf</span>
		</div>
	);
}
