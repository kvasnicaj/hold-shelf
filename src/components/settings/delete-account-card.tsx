import { AlertTriangle } from "lucide-react";
import { useDeleteAccount } from "#/components/settings/use-delete-account";
import { Button } from "#/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";

export function DeleteAccountCard() {
	const {
		open,
		confirmation,
		loading,
		error,
		isConfirmationValid,
		setConfirmation,
		handleDeleteAccount,
		handleOpenChange,
	} = useDeleteAccount();

	return (
		<Card className="border-destructive/40">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-destructive">
					<AlertTriangle className="h-5 w-5" />
					Delete account
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2 text-sm text-muted-foreground">
					<p>
						Permanently remove your Hold Shelf account and sign out everywhere.
					</p>
					<p>
						This will also delete your saved articles, tags, and other account
						data. This action cannot be undone.
					</p>
				</div>

				<Dialog open={open} onOpenChange={handleOpenChange}>
					<DialogTrigger asChild>
						<Button variant="destructive">Delete account</Button>
					</DialogTrigger>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle>Delete your account?</DialogTitle>
							<DialogDescription>
								Type <span className="font-medium text-foreground">DELETE</span>{" "}
								to confirm. You may need to sign in again if your session is no
								longer fresh.
							</DialogDescription>
						</DialogHeader>

						<form
							className="space-y-4"
							onSubmit={(event) => {
								event.preventDefault();
								void handleDeleteAccount();
							}}
						>
							<div className="space-y-2">
								<Label htmlFor="delete-account-confirmation">
									Type DELETE to continue
								</Label>
								<Input
									id="delete-account-confirmation"
									value={confirmation}
									onChange={(event) => setConfirmation(event.target.value)}
									autoComplete="off"
									autoCapitalize="characters"
									autoCorrect="off"
									spellCheck={false}
									placeholder="DELETE"
								/>
							</div>

							{error ? (
								<p className="text-sm text-destructive">{error}</p>
							) : null}

							<DialogFooter>
								<DialogClose asChild>
									<Button type="button" variant="outline" disabled={loading}>
										Cancel
									</Button>
								</DialogClose>
								<Button
									type="submit"
									variant="destructive"
									disabled={loading || !isConfirmationValid}
								>
									{loading ? "Deleting..." : "Permanently delete"}
								</Button>
							</DialogFooter>
						</form>
					</DialogContent>
				</Dialog>
			</CardContent>
		</Card>
	);
}
