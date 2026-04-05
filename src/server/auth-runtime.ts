export async function getSessionFromHeaders<TSession>({
	headers,
	getSessionFn,
}: {
	headers: Headers;
	getSessionFn: (input: { headers: Headers }) => Promise<TSession>;
}) {
	return getSessionFn({ headers });
}
