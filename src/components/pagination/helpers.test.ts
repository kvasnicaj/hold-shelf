import { describe, expect, it } from "vitest";
import {
	getPaginationItems,
	PAGINATION_ELLIPSIS,
} from "#/components/pagination/helpers";

describe("getPaginationItems", () => {
	it("returns all pages when the total page count is small", () => {
		expect(getPaginationItems(3, 5)).toEqual([1, 2, 3, 4, 5]);
	});

	it("returns a compact range near the start", () => {
		expect(getPaginationItems(2, 10)).toEqual([
			1,
			2,
			3,
			4,
			PAGINATION_ELLIPSIS,
			10,
		]);
	});

	it("returns a compact range in the middle", () => {
		expect(getPaginationItems(5, 10)).toEqual([
			1,
			PAGINATION_ELLIPSIS,
			4,
			5,
			6,
			PAGINATION_ELLIPSIS,
			10,
		]);
	});

	it("returns a compact range near the end", () => {
		expect(getPaginationItems(9, 10)).toEqual([
			1,
			PAGINATION_ELLIPSIS,
			7,
			8,
			9,
			10,
		]);
	});

	it("uses ellipses on both sides for large page counts", () => {
		expect(getPaginationItems(8, 20)).toEqual([
			1,
			PAGINATION_ELLIPSIS,
			7,
			8,
			9,
			PAGINATION_ELLIPSIS,
			20,
		]);
	});
});
