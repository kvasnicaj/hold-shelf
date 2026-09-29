import { createFileRoute } from "@tanstack/react-router";
import { TrashPage } from "#/components/library/trash-page";
export const Route = createFileRoute("/app/trash")({ component: TrashPage });
