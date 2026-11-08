import { act, renderHook } from "@testing-library/react";
import { expect, it } from "vitest";
import { useScopedState } from "#/hooks/use-scoped-state";

it("drops a selection made in one view once the view changes", () => {
	const { result, rerender } = renderHook(
		({ scope }) => useScopedState<string[]>(scope, []),
		{ initialProps: { scope: "page-1" } },
	);
	act(() => result.current[1](["a1"]));
	act(() => result.current[1]((previous) => [...previous, "a2"]));
	expect(result.current[0]).toEqual(["a1", "a2"]);

	rerender({ scope: "page-2" });
	expect(result.current[0]).toEqual([]);
	act(() => result.current[1]((previous) => [...previous, "b1"]));
	expect(result.current[0]).toEqual(["b1"]);

	rerender({ scope: "page-1" });
	expect(result.current[0]).toEqual([]);
});
