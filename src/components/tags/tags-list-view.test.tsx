import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TagsListView } from "#/components/tags/tags-list-view";
import { renderWithProviders } from "#/test/render";

const { tagItemMock } = vi.hoisted(() => ({
	tagItemMock: vi.fn(),
}));

vi.mock("#/components/tags/tag-item", () => ({
	TagItem: (props: {
		tag: { id: string; name: string; articleCount: number };
		isActive: boolean;
		mobile: boolean;
		onSelect: () => void;
		onRename: (id: string, name: string) => Promise<void>;
		onDelete: (id: string) => Promise<void>;
	}) => {
		tagItemMock(props);
		return (
			<button type="button" onClick={props.onSelect}>
				{props.tag.name}:{String(props.isActive)}:{String(props.mobile)}
			</button>
		);
	},
}));

describe("TagsListView", () => {
	beforeEach(() => {
		tagItemMock.mockClear();
	});

	it("shows the empty state message based on whether a filter is active", () => {
		const { rerender } = renderWithProviders(
			<TagsListView
				filteredTags={[]}
				filter=""
				onSelectTag={vi.fn()}
				onRename={vi.fn().mockResolvedValue(undefined)}
				onDelete={vi.fn().mockResolvedValue(undefined)}
			/>,
		);

		expect(screen.getByText("No tags yet.")).toBeInTheDocument();

		rerender(
			<TagsListView
				filteredTags={[]}
				filter="design"
				onSelectTag={vi.fn()}
				onRename={vi.fn().mockResolvedValue(undefined)}
				onDelete={vi.fn().mockResolvedValue(undefined)}
			/>,
		);

		expect(screen.getByText("No tags match.")).toBeInTheDocument();
		expect(tagItemMock).not.toHaveBeenCalled();
	});

	it("renders tag items with active and mobile state and forwards selection", async () => {
		const user = userEvent.setup();
		const onSelectTag = vi.fn();
		const onRename = vi.fn().mockResolvedValue(undefined);
		const onDelete = vi.fn().mockResolvedValue(undefined);

		renderWithProviders(
			<TagsListView
				filteredTags={[
					{ id: "t1", name: "Design", articleCount: 3 },
					{ id: "t2", name: "Engineering", articleCount: 1 },
				]}
				filter=""
				activeTagId="t2"
				mobile
				onSelectTag={onSelectTag}
				onRename={onRename}
				onDelete={onDelete}
			/>,
		);

		expect(tagItemMock).toHaveBeenCalledTimes(2);
		expect(tagItemMock.mock.calls[0]?.[0]).toEqual(
			expect.objectContaining({
				tag: expect.objectContaining({ id: "t1" }),
				isActive: false,
				mobile: true,
				onRename,
				onDelete,
			}),
		);
		expect(tagItemMock.mock.calls[1]?.[0]).toEqual(
			expect.objectContaining({
				tag: expect.objectContaining({ id: "t2" }),
				isActive: true,
				mobile: true,
			}),
		);

		await user.click(
			screen.getByRole("button", { name: "Engineering:true:true" }),
		);
		expect(onSelectTag).toHaveBeenCalledWith("t2");
	});
});
