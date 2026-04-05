import { getRequest } from "@tanstack/react-start/server";
import { getAuth } from "#/lib/auth";

export async function requireUserId(): Promise<string> {
	const request = getRequest();
	const session = await getAuth().api.getSession({ headers: request.headers });
	if (!session?.user?.id) throw new Error("Unauthorized");
	return session.user.id;
}
