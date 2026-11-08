import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppLayout } from "#/components/layout/app-layout";
import { isSignedIn } from "#/server/auth";
import { getUserSettings } from "#/server/user-settings";
export const Route = createFileRoute("/app")({
	beforeLoad: async () => {
		if (!(await isSignedIn())) {
			throw redirect({ to: "/login" });
		}
	},
	loader: async () => {
		const settings = await getUserSettings();
		return { settings };
	},
	component: AppLayout,
});
