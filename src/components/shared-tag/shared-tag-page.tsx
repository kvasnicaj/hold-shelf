import { Tag } from "@phosphor-icons/react";
import { getRouteApi, Link, useNavigate } from "@tanstack/react-router";
import { AppPagination } from "#/components/pagination/app-pagination";
import { PublicPageHeading } from "#/components/public/public-page-heading";
import { PublicPageLayout } from "#/components/public/public-page-layout";
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
		<PublicPageLayout
			actions={
				<Button asChild variant="ghost">
					<Link to="/" className="text-foreground no-underline">
						Create your own shelf
					</Link>
				</Button>
			}
		>
			<div className="flex flex-col gap-8">
				<PublicPageHeading
					eyebrow="Shared reading list"
					title={`${data.ownerFirstName} is sharing articles with you`}
				>
					<p className="flex items-center gap-2 text-sm text-muted-foreground">
						<span className="inline-flex h-6 items-center gap-1 rounded-sm bg-muted px-2 text-xs font-semibold text-foreground">
							<Tag className="size-3" />
							{data.tagName}
						</span>
						<span aria-hidden="true">·</span>
						<span className="tabular-nums">
							{data.articles.total} article
							{data.articles.total === 1 ? "" : "s"}
						</span>
					</p>
				</PublicPageHeading>

				{data.articles.total === 0 ? (
					<p className="border-y py-16 text-center font-serif text-xl font-semibold">
						There are no articles in this shared list yet.
					</p>
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

				<p className="text-center text-sm text-muted-foreground">
					Shared privately by link with Hold Shelf.
				</p>
			</div>
		</PublicPageLayout>
	);
}
