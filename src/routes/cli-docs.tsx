import { createFileRoute } from "@tanstack/react-router";
import { CliDocsPage } from "#/components/cli-docs/cli-docs-page";

export const Route = createFileRoute("/cli-docs")({
	head: () => ({
		meta: [
			{ title: "CLI documentation | Hold Shelf" },
			{
				name: "description",
				content:
					"Install the Hold Shelf CLI, connect your account, and manage your reading library from the terminal.",
			},
		],
	}),
	component: CliDocsPage,
});
