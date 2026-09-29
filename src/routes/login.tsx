import { createFileRoute, redirect } from "@tanstack/react-router";
import { safeReturnPath } from "#/components/auth/helpers";
import { LoginRoutePage } from "#/components/auth/login-route-page";
import { getSession } from "#/server/auth";

type LoginSearch = {
	redirectTo?: string;
};

export const Route = createFileRoute("/login")({
	validateSearch: (search: Record<string, unknown>): LoginSearch => ({
		redirectTo: safeReturnPath(search.redirectTo),
	}),
	beforeLoad: async ({ search }) => {
		const session = await getSession();
		if (session) {
			if (search.redirectTo) {
				throw redirect({ href: search.redirectTo });
			}
			throw redirect({ to: "/app/home" });
		}
	},
	component: LoginRoutePage,
});
