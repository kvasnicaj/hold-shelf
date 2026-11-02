import { fn } from "storybook/test";
import { sampleUser } from "#/stories/fixtures";
import type { MockScenario } from "./types";

let scenario: MockScenario = "default";
export function resetMockAuth(next: MockScenario = "default") {
	scenario = next;
}
export const authClient = {
	useSession: () => ({
		data:
			scenario === "signed-out"
				? null
				: { user: sampleUser, session: { id: "storybook-session" } },
		isPending: false,
		error: null,
	}),
	signOut: fn(async () => ({ error: null })),
	deleteUser: fn(async (_options: Record<string, never>) => ({
		error:
			scenario === "error"
				? { message: "Account deletion failed in this demo." }
				: null,
	})),
	signIn: {
		social: fn(
			async (_options: {
				provider: string;
				callbackURL: string;
				errorCallbackURL: string;
			}) => ({
				error: { message: "Storybook demo: GitHub sign-in is disabled." },
			}),
		),
	},
};
