import { getRouteApi } from "@tanstack/react-router";
import { LoginPage } from "#/components/auth/login-page";
export function LoginRoutePage() {
	const { redirectTo } = getRouteApi("/login").useSearch();
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
