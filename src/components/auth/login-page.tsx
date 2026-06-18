import { Bookmark, GitBranch } from "lucide-react";
import { useLoginPage } from "#/components/auth/use-login-page";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";

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
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<Card className="w-full max-w-sm">
				<CardHeader className="space-y-4 text-center">
					<div className="mx-auto flex items-center gap-2">
						<Bookmark className="h-7 w-7 text-(--lagoon)" />
						<span className="display-title text-2xl font-bold">Hold Shelf</span>
					</div>
					<div className="space-y-2">
						<CardTitle>Continue with GitHub</CardTitle>
						<p className="text-sm text-muted-foreground">
							Sign in to your library or create your account on first use with
							your GitHub profile.
						</p>
					</div>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<Button
							type="button"
							className="w-full"
							disabled={socialLoading}
							onClick={() => void handleGitHubSignIn()}
						>
							<GitBranch className="mr-2 h-4 w-4" />
							{socialLoading ? "Redirecting..." : "Continue with GitHub"}
						</Button>
						<p className="text-center text-xs leading-relaxed text-muted-foreground">
							GitHub is the only sign-in method for Hold Shelf. We&apos;ll use
							your GitHub account to create your profile and sign you in.
						</p>
						{error && <p className="text-sm text-destructive">{error}</p>}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
