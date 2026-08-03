import { getRouteApi, Link, useNavigate } from "@tanstack/react-router";
import { Bookmark, Tag } from "lucide-react";
import { AppPagination } from "#/components/pagination/app-pagination";
import { SharedArticleList } from "#/components/shared-tag/shared-article-list";
import { Button } from "#/components/ui/button";
import { SHARED_TAG_PAGE_SIZE } from "#/lib/shared-tag";

const route = getRouteApi("/share/$token");

export function SharedTagPage() {
	const data = route.useLoaderData();
	const search = route.useSearch();
	const navigate = useNavigate({ from: "/share/$token" });
	const page = search.page ?? 1;
	const totalPages = Math.max(
		1,
		Math.ceil(data.articles.total / SHARED_TAG_PAGE_SIZE),
	);

	function goToPage(nextPage: number) {
		navigate({
			search: nextPage > 1 ? { page: nextPage } : {},
			replace: true,
		});
		window.scrollTo({ top: 0, behavior: "smooth" });
	}

	return (
		<div className="relative min-h-svh overflow-hidden bg-background px-4 py-8 sm:px-6 sm:py-12">
			<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--lagoon)/0.08,transparent_65%)]" />

			<main className="relative mx-auto flex max-w-3xl flex-col gap-8">
				<header className="space-y-6 text-center">
					<Link
						to="/"
						className="inline-flex items-center gap-2 font-medium text-foreground no-underline"
					>
						<span className="flex size-10 items-center justify-center rounded-xl bg-(--lagoon)/10 ring-1 ring-(--lagoon)/20">
							<Bookmark className="size-5 text-(--lagoon)" />
						</span>
						Hold Shelf
					</Link>

					<div className="space-y-3">
						<p className="text-sm font-medium text-(--lagoon-deep)">
							Shared reading list
						</p>
						<h1 className="display-title text-3xl font-bold tracking-tight sm:text-4xl">
							{data.ownerFirstName} is sharing articles with you
						</h1>
						<div className="flex items-center justify-center gap-2 text-muted-foreground">
							<Tag className="size-4" />
							<span className="font-medium text-foreground">
								{data.tagName}
							</span>
							<span aria-hidden="true">·</span>
							<span>
								{data.articles.total} article
								{data.articles.total === 1 ? "" : "s"}
							</span>
						</div>
					</div>
				</header>

				{data.articles.total === 0 ? (
					<div className="rounded-xl border bg-card px-6 py-16 text-center shadow-sm">
						<p className="text-lg text-muted-foreground">
							There are no articles in this shared list yet.
						</p>
					</div>
				) : (
					<>
						<SharedArticleList articles={data.articles.items} />
						<AppPagination
							page={page}
							totalPages={totalPages}
							onPageChange={goToPage}
						/>
					</>
				)}

				<footer className="flex flex-col items-center gap-3 pb-4 text-center text-sm text-muted-foreground">
					<p>Shared privately by link with Hold Shelf.</p>
					<Button asChild variant="outline">
						<Link to="/">Create your own reading shelf</Link>
					</Button>
				</footer>
			</main>
		</div>
	);
}
