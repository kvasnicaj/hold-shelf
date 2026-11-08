import { createFileRoute, redirect } from "@tanstack/react-router";
import { safeReturnPath } from "#/components/auth/helpers";
import { LoginRoutePage } from "#/components/auth/login-route-page";
import { isSignedIn } from "#/server/auth";

type LoginSearch = {
	redirectTo?: string;
};

export const Route = createFileRoute("/login")({
	validateSearch: (search: Record<string, unknown>): LoginSearch => ({
		redirectTo: safeReturnPath(search.redirectTo),
	}),
	beforeLoad: async ({ search }) => {
		if (await isSignedIn()) {
			if (search.redirectTo) {
				throw redirect({ href: search.redirectTo });
			}
			throw redirect({ to: "/app/home" });
		}
	},
	component: LoginRoutePage,
});
