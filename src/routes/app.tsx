import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppLayout } from "#/components/layout/app-layout";
import { getSession } from "#/server/auth";
import { getUserSettings } from "#/server/user-settings";
export const Route = createFileRoute("/app")({
	beforeLoad: async () => {
		const session = await getSession();
		if (!session) {
			throw redirect({ to: "/login" });
		}
		return { session };
	},
	loader: async () => {
		const settings = await getUserSettings();
		return { settings };
	},
	component: AppLayout,
});
