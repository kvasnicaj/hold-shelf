import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TagPicker } from "#/components/tags/tag-picker";
import { renderWithProviders } from "#/test/render";

const availableTags = [
	{ id: "t1", name: "Design", color: null },
	{ id: "t2", name: "Engineering", color: "#123456" },
];

describe("TagPicker", () => {
	it("filters available tags from the search field", async () => {
		const user = userEvent.setup();
		renderWithProviders(
			<TagPicker
				availableTags={availableTags}
				selectedTagIds={[]}
				onAddTag={vi.fn()}
				onRemoveTag={vi.fn()}
				onCreateTag={vi.fn()}
				articleIds={["a1"]}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /manage tags/i }));
		await user.type(
			screen.getByPlaceholderText(/search or create tag/i),
			"eng",
		);

		expect(screen.getByText("Engineering")).toBeInTheDocument();
		expect(screen.queryByText("Design")).not.toBeInTheDocument();
	});

	it("toggles between add and remove callbacks for existing tags", async () => {
		const user = userEvent.setup();
		const onAddTag = vi.fn();
		const onRemoveTag = vi.fn();
		renderWithProviders(
			<TagPicker
				availableTags={availableTags}
				selectedTagIds={["t1"]}
				onAddTag={onAddTag}
				onRemoveTag={onRemoveTag}
				onCreateTag={vi.fn()}
				articleIds={["a1"]}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /manage tags/i }));
		await user.click(screen.getByText("Design"));
		await user.click(screen.getByText("Engineering"));

		expect(onRemoveTag).toHaveBeenCalledWith("t1", ["a1"]);
		expect(onAddTag).toHaveBeenCalledWith("t2", ["a1"]);
	});

	it("creates a new tag and assigns it to the selected articles", async () => {
		const user = userEvent.setup();
		const onAddTag = vi.fn();
		const onCreateTag = vi.fn().mockResolvedValue({
			id: "t3",
			name: "Research",
			color: null,
		});
		renderWithProviders(
			<TagPicker
				availableTags={availableTags}
				selectedTagIds={[]}
				onAddTag={onAddTag}
				onRemoveTag={vi.fn()}
				onCreateTag={onCreateTag}
				articleIds={["a1", "a2"]}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /manage tags/i }));
		await user.type(
			screen.getByPlaceholderText(/search or create tag/i),
			"Research",
		);
		await user.click(screen.getByText('Create "Research"'));

		await waitFor(() => expect(onCreateTag).toHaveBeenCalledWith("Research"));
		expect(onAddTag).toHaveBeenCalledWith("t3", ["a1", "a2"]);
	});
});
