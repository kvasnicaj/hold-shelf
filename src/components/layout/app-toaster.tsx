import type { CSSProperties } from "react";
import { Toaster } from "sonner";

const textButtonStyle: CSSProperties = {
	background: "transparent",
	color: "var(--on-inverse)",
	fontWeight: 700,
	textDecoration: "underline",
	textUnderlineOffset: "3px",
};

export function AppToaster() {
	return (
		<Toaster
			closeButton
			position="bottom-center"
			mobileOffset={{ bottom: 88 }}
			style={
				{
					"--normal-bg": "var(--inverse)",
					"--normal-text": "var(--on-inverse)",
					"--normal-border": "var(--inverse)",
					"--normal-bg-hover": "var(--inverse)",
					"--normal-border-hover": "var(--inverse)",
					"--border-radius": "0.5rem",
				} as CSSProperties
			}
			toastOptions={{
				actionButtonStyle: textButtonStyle,
				cancelButtonStyle: { ...textButtonStyle, fontWeight: 500 },
			}}
		/>
	);
}
