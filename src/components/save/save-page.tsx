import { Link } from "@tanstack/react-router";
import {
	Bookmark,
	CheckCircle2,
	CircleAlert,
	LoaderCircle,
} from "lucide-react";
import { BrandLogo } from "#/components/brand/brand-logo";
import { useSavePage } from "#/components/save/use-save-page";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";

type SavePageProps = {
	url?: string;
};

export function SavePage({ url }: SavePageProps) {
	const { message, status, save } = useSavePage(url);
	const isSuccess = status === "saved" || status === "duplicate";

	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-4 text-center">
					<div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-(--lagoon)/10 ring-1 ring-(--lagoon)/20">
						{status === "saving" ? (
							<LoaderCircle className="size-7 animate-spin text-(--lagoon)" />
						) : status === "idle" ? (
							<Bookmark className="size-7 text-(--lagoon)" />
						) : isSuccess ? (
							<CheckCircle2 className="size-7 text-(--lagoon)" />
						) : (
							<CircleAlert className="size-7 text-destructive" />
						)}
					</div>
					<div className="space-y-2">
						<div className="mx-auto flex items-center justify-center gap-2">
							<BrandLogo className="h-7" />
						</div>
						<CardTitle>
							{status === "idle"
								? "Save this article?"
								: status === "saving"
									? "Saving article"
									: isSuccess
										? "All set"
										: "We hit a snag"}
						</CardTitle>
						<p className="text-sm leading-relaxed text-muted-foreground">
							{message}
						</p>
						{url && (
							<p className="break-all text-xs text-muted-foreground">{url}</p>
						)}
					</div>
				</CardHeader>
				<CardContent className="space-y-3">
					{(status === "idle" || status === "error") && (
						<Button className="w-full" onClick={() => void save()}>
							{status === "error" ? "Try saving again" : "Save article"}
						</Button>
					)}
					<Button
						asChild
						className="w-full text-primary-foreground! hover:text-primary-foreground!"
					>
						<Link to="/app/articles">Open library</Link>
					</Button>
					<Button asChild variant="outline" className="w-full">
						<Link to="/app/home">Go to dashboard</Link>
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
