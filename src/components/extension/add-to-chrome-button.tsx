import type { VariantProps } from "class-variance-authority";
import { ExternalLink, Globe } from "lucide-react";
import { CHROME_EXTENSION_URL } from "#/components/home/helpers";
import { Button, type buttonVariants } from "#/components/ui/button";
import { cn } from "#/lib/utils";

type AddToChromeButtonProps = {
	className?: string;
	size?: VariantProps<typeof buttonVariants>["size"];
	variant?: VariantProps<typeof buttonVariants>["variant"];
};

export function AddToChromeButton({
	className,
	size = "default",
	variant = "outline",
}: AddToChromeButtonProps) {
	return (
		<Button asChild size={size} variant={variant} className={cn(className)}>
			<a href={CHROME_EXTENSION_URL} target="_blank" rel="noreferrer">
				<Globe className="size-4" />
				Add to Chrome
				<ExternalLink className="size-4" />
			</a>
		</Button>
	);
}
