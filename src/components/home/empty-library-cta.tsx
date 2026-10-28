export function EmptyLibraryCta() {
	return (
		<section className="rounded-xl border border-dashed px-6 py-12 text-center">
			<p className="font-serif text-xl font-semibold">Your library is empty.</p>
			<p className="mt-2 text-sm text-muted-foreground">
				Use Save a link to save your first article. Press S or paste a link
				anywhere on this page.
			</p>
		</section>
	);
}
