import { Link } from "@tanstack/react-router";
import {
	Bookmark,
	CheckCircle2,
	CircleAlert,
	LoaderCircle,
} from "lucide-react";
import { PublicPageLayout } from "#/components/public/public-page-layout";
import { useSavePage } from "#/components/save/use-save-page";
import { Button } from "#/components/ui/button";

type SavePageProps = {
	url?: string;
};

export function SavePage({ url }: SavePageProps) {
	const { message, status, save } = useSavePage(url);
	const isSuccess = status === "saved" || status === "duplicate";

	return (
		<PublicPageLayout centered>
			<section
				aria-live="polite"
				className="mx-auto w-full max-w-md space-y-6 rounded-xl border bg-card p-6 sm:p-8"
			>
				<div className="flex items-start gap-4">
					<div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-select">
						{status === "saving" ? (
							<LoaderCircle className="size-5 animate-spin text-mark" />
						) : status === "idle" ? (
							<Bookmark className="size-5 text-mark" />
						) : isSuccess ? (
							<CheckCircle2 className="size-5 text-mark" />
						) : (
							<CircleAlert className="size-5 text-destructive" />
						)}
					</div>
					<div className="min-w-0 space-y-1.5">
						<h1 className="font-serif text-2xl font-semibold">
							{status === "idle"
								? "Save this article?"
								: status === "saving"
									? "Saving article"
									: isSuccess
										? "All set"
										: "We hit a snag"}
						</h1>
						<p className="text-sm leading-relaxed text-muted-foreground">
							{message}
						</p>
						{url && (
							<p className="truncate text-xs text-muted-foreground" title={url}>
								{url}
							</p>
						)}
					</div>
				</div>
				<div className="flex flex-col gap-2 sm:flex-row-reverse">
					{status === "idle" || status === "error" ? (
						<Button className="sm:flex-1" onClick={() => void save()}>
							{status === "error" ? "Try saving again" : "Save article"}
						</Button>
					) : (
						<Button asChild className="sm:flex-1">
							<Link to="/app/articles" className="no-underline">
								Open Unread
							</Link>
						</Button>
					)}
					<Button asChild variant="ghost" className="sm:flex-1">
						<Link to="/app/home" className="text-foreground no-underline">
							Go to Home
						</Link>
					</Button>
				</div>
			</section>
		</PublicPageLayout>
	);
}
