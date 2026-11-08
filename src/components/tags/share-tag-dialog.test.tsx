import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ShareTagDialog } from "#/components/tags/share-tag-dialog";
import { renderWithProviders } from "#/test/render";

const { getTagShareMock, createTagShareMock, revokeTagShareMock } = vi.hoisted(
	() => ({
		getTagShareMock: vi.fn(),
		createTagShareMock: vi.fn(),
		revokeTagShareMock: vi.fn(),
	}),
);

vi.mock("#/server/tag-shares", () => ({
	getTagShare: getTagShareMock,
	createTagShare: createTagShareMock,
	revokeTagShare: revokeTagShareMock,
}));

describe("ShareTagDialog", () => {
	beforeEach(() => {
		getTagShareMock.mockReset().mockResolvedValue(null);
		createTagShareMock.mockReset().mockResolvedValue({
			tagId: "tag-1",
			token: `hss_${"a".repeat(32)}`,
			createdAt: new Date("2026-07-31T00:00:00.000Z"),
		});
		revokeTagShareMock.mockReset().mockResolvedValue({ success: true });
	});

	it("creates, copies, and revokes a tag sharing link", async () => {
		const user = userEvent.setup();
		const writeText = vi
			.spyOn(navigator.clipboard, "writeText")
			.mockResolvedValue(undefined);
		const onShareChange = vi.fn();
		renderWithProviders(
			<ShareTagDialog
				tagId="tag-1"
				tagName="Research"
				initialShare={null}
				onShareChange={onShareChange}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Share Research" }));
		await waitFor(() =>
			expect(getTagShareMock).toHaveBeenCalledWith({
				data: { tagId: "tag-1" },
			}),
		);
		expect(screen.getByText(/Sharing is off/)).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Create link" }));
		const sharingLink = await screen.findByLabelText(
			"Sharing link for Research",
		);
		expect(sharingLink).toHaveValue(
			`http://localhost/share/hss_${"a".repeat(32)}`,
		);
		expect(onShareChange).toHaveBeenCalledWith(
			expect.objectContaining({ tagId: "tag-1" }),
		);

		await user.click(screen.getByRole("button", { name: "Copy sharing link" }));
		expect(writeText).toHaveBeenCalledWith(
			`http://localhost/share/hss_${"a".repeat(32)}`,
		);
		expect(screen.getByText("Sharing link copied.")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Stop sharing" }));
		await user.click(screen.getByRole("button", { name: "Stop sharing" }));
		await waitFor(() =>
			expect(revokeTagShareMock).toHaveBeenCalledWith({
				data: { tagId: "tag-1" },
			}),
		);
		expect(
			screen.getByText("Sharing stopped. The old link no longer works."),
		).toBeInTheDocument();
		expect(onShareChange).toHaveBeenLastCalledWith(null);
	});

	it("keeps the revoke confirmation open when stopping fails", async () => {
		const user = userEvent.setup();
		const share = {
			tagId: "tag-1",
			token: `hss_${"b".repeat(32)}`,
			createdAt: new Date("2026-07-31T00:00:00.000Z"),
		};
		getTagShareMock.mockResolvedValue(share);
		revokeTagShareMock.mockRejectedValue(new Error("Network down"));
		renderWithProviders(
			<ShareTagDialog
				tagId="tag-1"
				tagName="Research"
				initialShare={share}
				onShareChange={vi.fn()}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Share Research" }));
		await user.click(
			await screen.findByRole("button", { name: "Stop sharing" }),
		);
		await user.click(screen.getByRole("button", { name: "Stop sharing" }));

		expect(await screen.findByRole("alert")).toHaveTextContent("Network down");
		expect(screen.getByText(/Stop sharing this tag\?/)).toBeInTheDocument();
		expect(screen.getByLabelText("Sharing link for Research")).toHaveValue(
			`http://localhost/share/hss_${"b".repeat(32)}`,
		);
	});

	it("cannot be dismissed while a sharing link is being created", async () => {
		const user = userEvent.setup();
		let finishCreate = () => {};
		createTagShareMock.mockImplementation(
			() =>
				new Promise((resolve) => {
					finishCreate = () =>
						resolve({
							tagId: "tag-1",
							token: `hss_${"c".repeat(32)}`,
							createdAt: new Date("2026-07-31T00:00:00.000Z"),
						});
				}),
		);
		renderWithProviders(
			<ShareTagDialog
				tagId="tag-1"
				tagName="Research"
				initialShare={null}
				onShareChange={vi.fn()}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Share Research" }));
		await user.click(
			await screen.findByRole("button", { name: "Create link" }),
		);
		await user.keyboard("{Escape}");
		expect(screen.getByRole("dialog")).toBeInTheDocument();

		finishCreate();
		expect(
			await screen.findByLabelText("Sharing link for Research"),
		).toHaveValue(`http://localhost/share/hss_${"c".repeat(32)}`);
		await user.keyboard("{Escape}");
		await waitFor(() =>
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
		);
	});
});
