import type { CSSProperties } from "react";
import { Toaster } from "sonner";

export function AppToaster() {
	return (
		<Toaster
			closeButton
			position="bottom-center"
			mobileOffset={{ bottom: 96 }}
			style={
				{
					"--normal-bg": "var(--popover)",
					"--normal-text": "var(--popover-foreground)",
					"--normal-border": "var(--border)",
					"--normal-bg-hover": "var(--accent)",
					"--normal-border-hover": "var(--ring)",
				} as CSSProperties
			}
			toastOptions={{
				actionButtonStyle: {
					background: "var(--foreground)",
					color: "var(--background)",
				},
				cancelButtonStyle: {
					background: "var(--secondary)",
					color: "var(--secondary-foreground)",
				},
			}}
		/>
	);
}
