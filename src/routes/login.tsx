import { createFileRoute, redirect } from "@tanstack/react-router";
import { LoginPage } from "#/components/auth/login-page";
import { getSession } from "#/server/auth";

export const Route = createFileRoute("/login")({
	beforeLoad: async () => {
		const session = await getSession();
		if (session) {
			throw redirect({ to: "/app/home" });
		}
	},
	component: LoginPage,
});
