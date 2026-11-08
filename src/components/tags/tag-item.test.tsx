import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TagItem } from "#/components/tags/tag-item";
import { renderWithProviders } from "#/test/render";

describe("TagItem", () => {
	it("renames a tag when editing is saved", async () => {
		const user = userEvent.setup();
		const onRename = vi.fn().mockResolvedValue(undefined);
		renderWithProviders(
			<TagItem
				tag={{ id: "t1", name: "Design", articleCount: 2 }}
				isActive={false}
				onSelect={vi.fn()}
				onRename={onRename}
				onDelete={vi.fn()}
			/>,
		);

		await user.click(
			screen.getByRole("button", { name: "Actions for Design" }),
		);
		await user.click(screen.getByRole("menuitem", { name: "Rename" }));
		const input = screen.getByDisplayValue("Design");
		await user.clear(input);
		await user.type(input, "Research");
		await user.tab();

		await waitFor(() =>
			expect(onRename).toHaveBeenCalledWith("t1", "Research"),
		);
	});

	it("supports selection and deletion", async () => {
		const user = userEvent.setup();
		const onSelect = vi.fn();
		const onDelete = vi.fn().mockResolvedValue(undefined);

		renderWithProviders(
			<TagItem
				tag={{ id: "t1", name: "Design", articleCount: 2 }}
				isActive={true}
				onSelect={onSelect}
				onRename={vi.fn().mockResolvedValue(undefined)}
				onDelete={onDelete}
			/>,
		);

		await user.click(screen.getByText("Design"));
		expect(onSelect).toHaveBeenCalled();

		await user.click(
			screen.getByRole("button", { name: "Actions for Design" }),
		);
		await user.click(screen.getByRole("menuitem", { name: "Delete tag" }));
		await waitFor(() => expect(onDelete).toHaveBeenCalledWith("t1"));
	});

	it("renames once when submit is followed by blur and shows a failed rename", async () => {
		const user = userEvent.setup();
		let rejectRename = (_error: Error) => {};
		const onRename = vi.fn(
			() =>
				new Promise<void>((_resolve, reject) => {
					rejectRename = reject;
				}),
		);
		renderWithProviders(
			<TagItem
				tag={{ id: "t1", name: "Design", articleCount: 2 }}
				isActive={false}
				onSelect={vi.fn()}
				onRename={onRename}
				onDelete={vi.fn()}
			/>,
		);

		await user.click(
			screen.getByRole("button", { name: "Actions for Design" }),
		);
		await user.click(screen.getByRole("menuitem", { name: "Rename" }));
		const input = screen.getByDisplayValue("Design");
		await user.clear(input);
		await user.type(input, "Research{Enter}");
		await user.tab();
		expect(onRename).toHaveBeenCalledTimes(1);

		rejectRename(new Error("A tag with that name already exists."));
		expect(await screen.findByRole("alert")).toHaveTextContent(
			"A tag with that name already exists.",
		);
		expect(screen.getByDisplayValue("Research")).toBeInTheDocument();
	});
});
