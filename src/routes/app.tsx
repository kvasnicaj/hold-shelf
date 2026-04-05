import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AppSidebar } from "#/components/layout/app-sidebar";
import { AppToolbar } from "#/components/layout/app-toolbar";
import { MobileBottomBar } from "#/components/layout/mobile-bottom-bar";
import {
	ToolbarActionsProvider,
	useToolbarActions,
} from "#/components/layout/toolbar-actions";
import { getSession } from "#/server/auth";

export const Route = createFileRoute("/app")({
	beforeLoad: async () => {
		const session = await getSession();
		if (!session) {
			throw redirect({ to: "/login" });
		}
		return { session };
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
				<main className="min-w-0 flex-1 p-4 pb-24 md:pb-4 lg:p-6">
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
			<div className="mb-4 flex items-center justify-end">
				<AppToolbar
					actions={actions}
					searchPlaceholder={searchConfig?.placeholder}
					onSearch={searchConfig?.onSearch}
				/>
			</div>
		);
	}

	return (
		<div className="mb-4 grid grid-cols-[1fr_auto] items-center gap-2">
			<div className="@container flex min-w-0 justify-end @min-[260px]:justify-center">
				{centerContent}
			</div>
			<AppToolbar
				actions={actions}
				searchPlaceholder={searchConfig?.placeholder}
				onSearch={searchConfig?.onSearch}
			/>
		</div>
	);
}
