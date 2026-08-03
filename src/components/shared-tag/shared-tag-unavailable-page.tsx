import { Link } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { Button } from "#/components/ui/button";

export function SharedTagUnavailablePage() {
	return (
		<div className="flex min-h-svh items-center justify-center bg-background px-6 text-center">
			<div className="flex max-w-md flex-col items-center gap-4">
				<div className="flex size-14 items-center justify-center rounded-2xl bg-(--lagoon)/10 ring-1 ring-(--lagoon)/20">
					<Bookmark className="size-7 text-(--lagoon)" />
				</div>
				<h1 className="display-title text-3xl font-bold">
					This shared shelf is unavailable
				</h1>
				<p className="text-muted-foreground">
					The link may have been stopped or may no longer exist.
				</p>
				<Button asChild variant="outline">
					<Link to="/">Go to Hold Shelf</Link>
				</Button>
			</div>
		</div>
	);
}
