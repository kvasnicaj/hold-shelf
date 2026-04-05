import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginPage } from "#/components/auth/login-page";
import { getSession } from "#/server/auth";

type LoginSearch = {
	redirectTo?: string;
};

export const Route = createFileRoute("/login")({
	validateSearch: (search: Record<string, unknown>): LoginSearch => ({
		redirectTo:
			typeof search.redirectTo === "string" && search.redirectTo.startsWith("/")
				? search.redirectTo
				: undefined,
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
	component: LoginRouteComponent,
});

function LoginRouteComponent() {
	const { redirectTo } = Route.useSearch();
	return (
		<LoginPage
			callbackURL={redirectTo ?? "/app/home"}
			errorCallbackURL={
				redirectTo
					? `/login?redirectTo=${encodeURIComponent(redirectTo)}`
					: "/login"
			}
		/>
	);
}
