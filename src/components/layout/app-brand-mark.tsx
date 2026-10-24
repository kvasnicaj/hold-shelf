import { BrandLogo } from "#/components/brand/brand-logo";

export function AppBrandMark() {
	return (
		<div className="flex h-9 w-9 items-center justify-center md:hidden">
			<BrandLogo variant="symbol" />
		</div>
	);
}
