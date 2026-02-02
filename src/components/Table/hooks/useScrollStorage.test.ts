import { renderHook } from "@testing-library/react";
import { useScrollStorage } from "src/components/Table/hooks/useScrollStorage";

describe("useScrollStorage", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("returns undefined values when persistScrollPosition is false", () => {
    const { result } = renderHook(() => useScrollStorage("myTable", false));
    expect(result.current.getScrollIndex()).toBeUndefined();
  });

  it("returns the saved current scroll index", () => {
    sessionStorage.setItem("scrollPosition_/_myTable", "75");
    const { result } = renderHook(() => useScrollStorage("myTable"));
    expect(result.current.getScrollIndex()).toBe(75);
  });

  it("saves the current scroll index to session storage", () => {
    const { result } = renderHook(() => useScrollStorage("myTable"));
    result.current.setScrollIndex(75);
    expect(sessionStorage.getItem("scrollPosition_/_myTable")).toBe("75");
    expect(result.current.getScrollIndex()).toBe(75);
  });

  it("memoizes the result based on tableId", () => {
    const { result, rerender } = renderHook(({ id }) => useScrollStorage(id), {
      initialProps: { id: "myTable" },
    });
    const firstResult = result.current;
    // Rerender with same props
    rerender({ id: "myTable" });
    expect(result.current).toBe(firstResult);
    // Rerender with different tableId
    rerender({ id: "otherTable" });
    expect(result.current).not.toBe(firstResult);
  });
});
