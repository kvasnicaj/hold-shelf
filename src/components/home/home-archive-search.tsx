import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";

export function HomeArchiveSearch() {
	const navigate = useNavigate({ from: "/app/home" });
	const [query, setQuery] = useState("");

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const trimmedQuery = query.trim();

		void navigate({
			to: "/app/archive",
			search: {
				q: trimmedQuery || undefined,
			},
		});
	}

	return (
		<section className="rounded-2xl border bg-card/80 p-4 shadow-sm sm:p-5">
			<div className="space-y-1">
				<h2 className="text-lg font-semibold">Search your archive</h2>
				<p className="text-sm text-muted-foreground">
					Find anything you&apos;ve saved and jump straight into Archive.
				</p>
			</div>

			<form
				onSubmit={handleSubmit}
				className="mt-4 flex flex-col gap-3 sm:flex-row"
			>
				<div className="relative min-w-0 flex-1">
					<Search className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
					<Input
						type="search"
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Search all archived articles..."
						aria-label="Search all archived articles"
						className="h-10 rounded-xl border-border/80 bg-background pl-12 text-base shadow-none sm:h-11"
					/>
				</div>

				<Button className="h-10 rounded-xl px-5 sm:h-11">Search</Button>
			</form>
		</section>
	);
}
