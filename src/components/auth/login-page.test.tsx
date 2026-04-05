import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginPage } from "#/components/auth/login-page";
import { renderWithProviders } from "#/test/render";

const { signInSocialMock } = vi.hoisted(() => ({
	signInSocialMock: vi.fn(),
}));

vi.mock("@tanstack/react-router", async () => {
	const actual = await vi.importActual<typeof import("@tanstack/react-router")>(
		"@tanstack/react-router",
	);

	return {
		...actual,
		useRouter: () => ({
			navigate: vi.fn(),
		}),
	};
});

vi.mock("#/lib/auth-client", () => ({
	authClient: {
		signIn: {
			social: signInSocialMock,
		},
	},
}));

describe("LoginPage", () => {
	beforeEach(() => {
		signInSocialMock.mockReset();
	});

	it("renders GitHub as the only sign-in method", () => {
		renderWithProviders(<LoginPage />);

		expect(
			screen.getByRole("button", { name: /continue with github/i }),
		).toBeInTheDocument();
		expect(
			screen.getByText(
				/sign in to your library or create your account on first use/i,
			),
		).toBeInTheDocument();
		expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();
		expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();
	});

	it("starts the GitHub OAuth flow", async () => {
		const user = userEvent.setup();
		signInSocialMock.mockResolvedValue({});
		renderWithProviders(<LoginPage />);

		await user.click(
			screen.getByRole("button", { name: /continue with github/i }),
		);

		await waitFor(() =>
			expect(signInSocialMock).toHaveBeenCalledWith({
				provider: "github",
				callbackURL: "/app/home",
				errorCallbackURL: "/login",
			}),
		);
	});

	it("shows a redirecting state while OAuth starts", async () => {
		const user = userEvent.setup();
		let resolveSignIn: (() => void) | undefined;
		signInSocialMock.mockImplementation(
			() =>
				new Promise((resolve) => {
					resolveSignIn = () => resolve({});
				}),
		);
		renderWithProviders(<LoginPage />);

		await user.click(
			screen.getByRole("button", { name: /continue with github/i }),
		);

		expect(screen.getByRole("button", { name: /redirecting/i })).toBeDisabled();

		resolveSignIn?.();
		await waitFor(() =>
			expect(
				screen.getByRole("button", { name: /continue with github/i }),
			).toBeEnabled(),
		);
	});

	it("surfaces errors when GitHub sign-in cannot start", async () => {
		const user = userEvent.setup();
		signInSocialMock.mockResolvedValue({
			error: { message: "GitHub sign in failed" },
		});
		renderWithProviders(<LoginPage />);

		await user.click(
			screen.getByRole("button", { name: /continue with github/i }),
		);

		expect(
			await screen.findByText("GitHub sign in failed"),
		).toBeInTheDocument();
	});

	it("shows a generic error when GitHub sign-in throws", async () => {
		const user = userEvent.setup();
		signInSocialMock.mockRejectedValue(new Error("network"));
		renderWithProviders(<LoginPage />);

		await user.click(
			screen.getByRole("button", { name: /continue with github/i }),
		);

		expect(
			await screen.findByText("GitHub sign in failed"),
		).toBeInTheDocument();
	});
});
