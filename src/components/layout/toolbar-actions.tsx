import { createContext, useContext, useEffect, useState } from "react";

type ToolbarActionsContextType = {
	actions: React.ReactNode;
	setActions: (actions: React.ReactNode) => void;
};

const ToolbarActionsContext = createContext<ToolbarActionsContextType>({
	actions: null,
	setActions: () => {},
});

export function ToolbarActionsProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [actions, setActions] = useState<React.ReactNode>(null);
	return (
		<ToolbarActionsContext.Provider
			value={{
				actions,
				setActions,
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
