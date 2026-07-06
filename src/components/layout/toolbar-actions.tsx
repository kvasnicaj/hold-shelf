import { createContext, useContext, useEffect, useState } from "react";

type ToolbarActionsContextType = {
	actions: React.ReactNode;
	setActions: (actions: React.ReactNode) => void;
	centerContent: React.ReactNode;
	setCenterContent: (content: React.ReactNode) => void;
};

const ToolbarActionsContext = createContext<ToolbarActionsContextType>({
	actions: null,
	setActions: () => {},
	centerContent: null,
	setCenterContent: () => {},
});

export function ToolbarActionsProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [actions, setActions] = useState<React.ReactNode>(null);
	const [centerContent, setCenterContent] = useState<React.ReactNode>(null);
	return (
		<ToolbarActionsContext.Provider
			value={{
				actions,
				setActions,
				centerContent,
				setCenterContent,
			}}
		>
			{children}
		</ToolbarActionsContext.Provider>
	);
}

export function useToolbarActions() {
	const ctx = useContext(ToolbarActionsContext);
	return {
		actions: ctx.actions,
		centerContent: ctx.centerContent,
	};
}

export function ToolbarSlot({ children }: { children: React.ReactNode }) {
	const { setActions } = useContext(ToolbarActionsContext);

	useEffect(() => {
		setActions(children);
		return () => setActions(null);
	}, [children, setActions]);

	return null;
}

export function ToolbarCenter({ children }: { children: React.ReactNode }) {
	const { setCenterContent } = useContext(ToolbarActionsContext);

	useEffect(() => {
		setCenterContent(children);
		return () => setCenterContent(null);
	}, [children, setCenterContent]);

	return null;
}
