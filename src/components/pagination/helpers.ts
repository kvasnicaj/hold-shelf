export const PAGINATION_ELLIPSIS = "ellipsis";

export type PaginationItem = number | typeof PAGINATION_ELLIPSIS;

export function getPaginationItems(
	currentPage: number,
	totalPages: number,
): PaginationItem[] {
	if (totalPages <= 1) {
		return [1];
	}

	if (totalPages <= 7) {
		return Array.from({ length: totalPages }, (_, index) => index + 1);
	}

	if (currentPage <= 3) {
		return [1, 2, 3, 4, PAGINATION_ELLIPSIS, totalPages];
	}

	if (currentPage >= totalPages - 2) {
		return [
			1,
			PAGINATION_ELLIPSIS,
			totalPages - 3,
			totalPages - 2,
			totalPages - 1,
			totalPages,
		];
	}

	return [
		1,
		PAGINATION_ELLIPSIS,
		currentPage - 1,
		currentPage,
		currentPage + 1,
		PAGINATION_ELLIPSIS,
		totalPages,
	];
}
