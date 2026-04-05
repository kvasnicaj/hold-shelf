import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	Sidebar,
	SidebarProvider,
	SidebarTrigger,
} from "#/components/ui/sidebar";
import { renderWithProviders } from "#/test/render";

const { mobileState } = vi.hoisted(() => ({
	mobileState: {
		value: false,
	},
}));

vi.mock("#/hooks/use-mobile", () => ({
	useIsMobile: () => mobileState.value,
}));

describe("Sidebar", () => {
	beforeEach(() => {
		mobileState.value = false;
	});

	it('renders the static branch when collapsible is "none"', () => {
		const { container } = renderWithProviders(
			<SidebarProvider>
				<Sidebar collapsible="none">
					<div>Static content</div>
				</Sidebar>
			</SidebarProvider>,
		);

		expect(screen.getByText("Static content")).toBeInTheDocument();
		expect(container.querySelector('[data-slot="sidebar"]')).toBeInTheDocument();
	});

	it("renders the desktop shell and toggles open state through the trigger", async () => {
		const user = userEvent.setup();
		const onOpenChange = vi.fn();
		const { container } = renderWithProviders(
			<SidebarProvider open={true} onOpenChange={onOpenChange}>
				<Sidebar variant="floating">
					<div>Desktop content</div>
				</Sidebar>
				<SidebarTrigger />
			</SidebarProvider>,
		);

		await user.click(screen.getByRole("button", { name: /toggle sidebar/i }));

		expect(onOpenChange).toHaveBeenCalledWith(false);
		expect(
			container.querySelector('[data-slot="sidebar"][data-variant="floating"]'),
		).toBeInTheDocument();
	});

	it("renders the mobile sheet when the sidebar is opened on mobile", async () => {
		const user = userEvent.setup();
		mobileState.value = true;
		renderWithProviders(
			<SidebarProvider>
				<Sidebar>
					<div>Mobile content</div>
				</Sidebar>
				<SidebarTrigger />
			</SidebarProvider>,
		);

		await user.click(screen.getByRole("button", { name: /toggle sidebar/i }));

		await waitFor(() =>
			expect(screen.getByText("Mobile content")).toBeInTheDocument(),
		);
	});
});
