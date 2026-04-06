import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DeleteAccountCard } from "#/components/settings/delete-account-card";
import { renderWithProviders } from "#/test/render";

const { deleteUserMock, navigateMock } = vi.hoisted(() => ({
	deleteUserMock: vi.fn(),
	navigateMock: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => {
	return {
		useRouter: () => ({
			navigate: navigateMock,
		}),
	};
});

vi.mock("#/lib/auth-client", () => ({
	authClient: {
		deleteUser: deleteUserMock,
	},
}));

describe("DeleteAccountCard", () => {
	beforeEach(() => {
		deleteUserMock.mockReset();
		navigateMock.mockReset();
	});

	it("requires the confirmation phrase before deletion is enabled", async () => {
		const user = userEvent.setup();

		renderWithProviders(<DeleteAccountCard />);

		await user.click(screen.getByRole("button", { name: /delete account/i }));

		const submitButton = screen.getByRole("button", {
			name: /permanently delete/i,
		});
		expect(submitButton).toBeDisabled();

		await user.type(
			screen.getByLabelText(/type delete to continue/i),
			"DELETE",
		);

		expect(submitButton).toBeEnabled();
	});

	it("deletes the account and returns the user to login", async () => {
		const user = userEvent.setup();
		deleteUserMock.mockResolvedValue({ data: { success: true } });
		navigateMock.mockResolvedValue(undefined);

		renderWithProviders(<DeleteAccountCard />);

		await user.click(screen.getByRole("button", { name: /delete account/i }));
		await user.type(
			screen.getByLabelText(/type delete to continue/i),
			"DELETE",
		);
		await user.click(
			screen.getByRole("button", { name: /permanently delete/i }),
		);

		await waitFor(() => expect(deleteUserMock).toHaveBeenCalledWith({}));
		await waitFor(() =>
			expect(navigateMock).toHaveBeenCalledWith({ to: "/login" }),
		);
	});

	it("shows a helpful error when the session is no longer fresh", async () => {
		const user = userEvent.setup();
		deleteUserMock.mockResolvedValue({
			error: { code: "SESSION_EXPIRED", message: "Session expired" },
		});

		renderWithProviders(<DeleteAccountCard />);

		await user.click(screen.getByRole("button", { name: /delete account/i }));
		await user.type(
			screen.getByLabelText(/type delete to continue/i),
			"DELETE",
		);
		await user.click(
			screen.getByRole("button", { name: /permanently delete/i }),
		);

		expect(
			await screen.findByText(/please sign in again, then retry/i),
		).toBeInTheDocument();
		expect(navigateMock).not.toHaveBeenCalled();
	});
});
