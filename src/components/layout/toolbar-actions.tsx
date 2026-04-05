import { createContext, useContext, useEffect, useState } from "react";

type SearchConfig = {
	placeholder: string;
	onSearch: (query: string) => void;
} | null;

type ToolbarActionsContextType = {
	actions: React.ReactNode;
	setActions: (actions: React.ReactNode) => void;
	centerContent: React.ReactNode;
	setCenterContent: (content: React.ReactNode) => void;
	searchConfig: SearchConfig;
	setSearchConfig: (config: SearchConfig) => void;
};

const ToolbarActionsContext = createContext<ToolbarActionsContextType>({
	actions: null,
	setActions: () => {},
	centerContent: null,
	setCenterContent: () => {},
	searchConfig: null,
	setSearchConfig: () => {},
});

export function ToolbarActionsProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [actions, setActions] = useState<React.ReactNode>(null);
	const [centerContent, setCenterContent] = useState<React.ReactNode>(null);
	const [searchConfig, setSearchConfig] = useState<SearchConfig>(null);
	return (
		<ToolbarActionsContext.Provider
			value={{
				actions,
				setActions,
				centerContent,
				setCenterContent,
				searchConfig,
				setSearchConfig,
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
		searchConfig: ctx.searchConfig,
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

export function ToolbarSearch({
	placeholder,
	onSearch,
}: {
	placeholder: string;
	onSearch: (query: string) => void;
}) {
	const { setSearchConfig } = useContext(ToolbarActionsContext);

	useEffect(() => {
		setSearchConfig({ placeholder, onSearch });
		return () => setSearchConfig(null);
	}, [placeholder, onSearch, setSearchConfig]);

	return null;
}
