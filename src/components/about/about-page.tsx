import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "#/components/brand/brand-logo";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";

export function AboutPage() {
	return (
		<div className="relative min-h-svh overflow-hidden bg-background px-6 py-10">
			<div className="relative mx-auto flex max-w-3xl flex-col gap-6">
				<div className="flex items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<div className="flex size-12 items-center justify-center rounded-2xl bg-select ring-1 ring-mark/20">
							<BrandLogo variant="symbol" className="size-6" decorative />
						</div>
						<div>
							<p className="font-serif text-2xl font-semibold text-foreground">
								About Hold Shelf
							</p>
							<p className="text-sm text-muted-foreground">
								A simple reading shelf for the things worth coming back to
							</p>
						</div>
					</div>

					<Button asChild variant="outline">
						<Link to="/">
							<ArrowLeft className="size-4" />
							Back home
						</Link>
					</Button>
				</div>

				<Card>
					<CardHeader>
						<CardTitle>What the app is for</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
						<p>
							Hold Shelf is a read-it-later app for saving articles you want to
							keep, without turning your reading list into noise.
						</p>
						<p>
							You can save links from the web app or from the browser extension,
							then come back to them when you actually have time to read.
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>How it feels</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
						<p>
							The goal is to keep reading calm and intentional. Hold Shelf gives
							you a quiet place to collect useful articles, organize them, and
							pick them up later without clutter.
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Contact</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
						<p>
							For questions, feedback, or support, email{" "}
							<a
								href="mailto:info@hold-shelf.com"
								className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
							>
								info@hold-shelf.com
							</a>
							.
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
