import { createContext, type ReactNode } from "react";

export const StoryCanvasContext = createContext<{
	children: ReactNode;
	appShell: boolean;
}>({ children: null, appShell: false });
