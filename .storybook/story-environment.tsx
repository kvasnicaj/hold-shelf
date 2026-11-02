import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import { AppToaster } from "#/components/layout/app-toaster";
import { createStoryQueryClient, createStoryRouter } from "./helpers";
import type { MockScenario } from "./mocks/types";
import { StoryCanvasContext } from "./story-context";

type StoryEnvironmentProps = {
	children: ReactNode;
	path?: string;
	scenario?: MockScenario;
	appShell?: boolean;
};

export function StoryEnvironment({
	children,
	path = "/app/home",
	scenario = "default",
	appShell = false,
}: StoryEnvironmentProps) {
	const [queryClient] = useState(createStoryQueryClient);
	const [router] = useState(() => createStoryRouter(path, scenario));
	return (
		<QueryClientProvider client={queryClient}>
			<StoryCanvasContext.Provider value={{ children, appShell }}>
				<RouterProvider router={router} />
				<AppToaster />
			</StoryCanvasContext.Provider>
		</QueryClientProvider>
	);
}
