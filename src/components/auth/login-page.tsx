import { GithubLogo } from "@phosphor-icons/react";
import { useLoginPage } from "#/components/auth/use-login-page";
import { PublicPageLayout } from "#/components/public/public-page-layout";
import { Button } from "#/components/ui/button";

type LoginPageProps = {
	callbackURL?: string;
	errorCallbackURL?: string;
};

export function LoginPage({
	callbackURL = "/app/home",
	errorCallbackURL = "/login",
}: LoginPageProps) {
	const { error, socialLoading, handleGitHubSignIn } = useLoginPage({
		callbackURL,
		errorCallbackURL,
	});

	return (
		<PublicPageLayout centered>
			<section className="mx-auto w-full max-w-sm space-y-6 rounded-xl border bg-card p-6 sm:p-8">
				<div className="space-y-2">
					<h1 className="font-serif text-2xl font-semibold">
						Sign in to Hold Shelf
					</h1>
					<p className="text-sm leading-relaxed text-muted-foreground">
						Hold Shelf signs in with GitHub. Your first visit creates your
						library.
					</p>
				</div>
				<div className="space-y-3">
					<Button
						type="button"
						size="lg"
						className="w-full"
						disabled={socialLoading}
						onClick={() => void handleGitHubSignIn()}
					>
						<GithubLogo />
						{socialLoading ? "Redirecting..." : "Continue with GitHub"}
					</Button>
					{error && (
						<p role="alert" className="text-sm text-destructive">
							{error}
						</p>
					)}
				</div>
			</section>
		</PublicPageLayout>
	);
}
