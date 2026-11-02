import { queryOptions } from "@tanstack/react-query";
import { getContinueReading } from "#/server/library";

export function continueReadingOptions() {
	return queryOptions({
		queryKey: ["continue-reading"],
		queryFn: () => getContinueReading(),
		staleTime: 30000,
	});
}
