import type { MouseEvent } from "react";
import {
	getPaginationItems,
	PAGINATION_ELLIPSIS,
} from "#/components/pagination/helpers";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "#/components/ui/pagination";
import { cn } from "#/lib/utils";

type AppPaginationProps = {
	page: number;
	totalPages: number;
	onPageChange: (page: number) => void;
};

export function AppPagination({
	page,
	totalPages,
	onPageChange,
}: AppPaginationProps) {
	if (totalPages <= 1) {
		return null;
	}

	const items = getPaginationItems(page, totalPages);
	const isPreviousDisabled = page <= 1;
	const isNextDisabled = page >= totalPages;
	let ellipsisCount = 0;

	function handlePageChange(nextPage: number) {
		if (nextPage === page) {
			return;
		}

		onPageChange(nextPage);
	}

	function handleLinkClick(
		event: MouseEvent<HTMLAnchorElement>,
		nextPage: number,
		disabled = false,
	) {
		event.preventDefault();

		if (disabled) {
			return;
		}

		handlePageChange(nextPage);
	}

	return (
		<Pagination>
			<PaginationContent>
				<PaginationItem>
					<PaginationPrevious
						href={isPreviousDisabled ? undefined : "#"}
						aria-disabled={isPreviousDisabled}
						tabIndex={isPreviousDisabled ? -1 : undefined}
						className={cn(
							isPreviousDisabled && "pointer-events-none opacity-50",
						)}
						onClick={(event) =>
							handleLinkClick(event, page - 1, isPreviousDisabled)
						}
					/>
				</PaginationItem>

				{items.map((item) => (
					<PaginationItem
						key={
							item === PAGINATION_ELLIPSIS
								? `ellipsis-${++ellipsisCount}`
								: `page-${item}`
						}
					>
						{item === PAGINATION_ELLIPSIS ? (
							<PaginationEllipsis />
						) : (
							<PaginationLink
								href="#"
								isActive={item === page}
								aria-label={`Go to page ${item}`}
								onClick={(event) => handleLinkClick(event, item)}
							>
								{item}
							</PaginationLink>
						)}
					</PaginationItem>
				))}

				<PaginationItem>
					<PaginationNext
						href={isNextDisabled ? undefined : "#"}
						aria-disabled={isNextDisabled}
						tabIndex={isNextDisabled ? -1 : undefined}
						className={cn(isNextDisabled && "pointer-events-none opacity-50")}
						onClick={(event) =>
							handleLinkClick(event, page + 1, isNextDisabled)
						}
					/>
				</PaginationItem>
			</PaginationContent>
		</Pagination>
	);
}
