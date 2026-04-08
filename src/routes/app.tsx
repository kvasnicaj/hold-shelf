import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppBrandMark } from "#/components/layout/app-brand-mark";
import { AppSidebar } from "#/components/layout/app-sidebar";
import { AppToolbar } from "#/components/layout/app-toolbar";
import { MobileBottomBar } from "#/components/layout/mobile-bottom-bar";
import {
	ToolbarActionsProvider,
	useToolbarActions,
} from "#/components/layout/toolbar-actions";
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

function AppLayout() {
	return (
		<ToolbarActionsProvider>
			<div className="flex min-h-screen bg-background">
				<div className="sticky top-0 hidden h-screen shrink-0 p-2 md:flex">
					<AppSidebar />
				</div>
				<main className="min-w-0 flex-1 p-4 pb-28 md:pb-4 lg:p-6">
					<TopBar />
					<Outlet />
				</main>
			</div>
			<MobileBottomBar />
		</ToolbarActionsProvider>
	);
}

function TopBar() {
	const { actions, centerContent, searchConfig } = useToolbarActions();

	if (!centerContent) {
		return (
			<div className="mb-4 flex items-center gap-3">
				<AppBrandMark />
				<div className="min-w-0 flex-1">
					<AppToolbar
						actions={actions}
						searchValue={searchConfig?.value}
						searchPlaceholder={searchConfig?.placeholder}
						onSearch={searchConfig?.onSearch}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="mb-4 grid gap-2 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
			<div className="order-2 @container flex min-w-0 justify-center md:order-1 md:justify-end @min-[260px]:justify-center">
				{centerContent}
			</div>
			<div className="order-1 flex items-center gap-3 md:order-2 md:justify-end">
				<AppBrandMark />
				<div className="min-w-0 flex-1 md:flex-none">
					<AppToolbar
						actions={actions}
						searchValue={searchConfig?.value}
						searchPlaceholder={searchConfig?.placeholder}
						onSearch={searchConfig?.onSearch}
					/>
				</div>
			</div>
		</div>
	);
}
