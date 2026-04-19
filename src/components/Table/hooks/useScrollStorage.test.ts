import { renderHook } from "@testing-library/react";
import { useScrollStorage } from "src/components/Table/hooks/useScrollStorage";
import { getPageSessionStorageKey } from "src/hooks/usePageSessionStorage";

describe("useScrollStorage", () => {
  beforeEach(() => {
    sessionStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  it("returns undefined values when persistScrollPosition is false", () => {
    const { result } = renderHook(() => useScrollStorage("myTable", false));
    expect(result.current.getScrollIndex()).toBeUndefined();
  });

  it("returns the saved current scroll index", () => {
    sessionStorage.setItem(getPageSessionStorageKey("scrollPosition", { componentId: "myTable", includeSearch: true }), "75");
    const { result } = renderHook(() => useScrollStorage("myTable"));
    expect(result.current.getScrollIndex()).toBe(75);
  });

  it("saves the current scroll index to session storage", () => {
    const { result } = renderHook(() => useScrollStorage("myTable"));
    result.current.setScrollIndex(75);
    expect(sessionStorage.getItem(getPageSessionStorageKey("scrollPosition", { componentId: "myTable", includeSearch: true }))).toBe("75");
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

  it("includes search params in storage key for different filter states", () => {
    const { result, rerender } = renderHook(() => useScrollStorage("myTable"));
    result.current.setScrollIndex(100);

    expect(sessionStorage.getItem(getPageSessionStorageKey("scrollPosition", { componentId: "myTable", includeSearch: true }))).toBe("100");
    expect(result.current.getScrollIndex()).toBe(100);

    window.history.replaceState({}, "", "/?filter=active");
    rerender();

    expect(result.current.getScrollIndex()).toBeUndefined();
    result.current.setScrollIndex(50);
    expect(sessionStorage.getItem(getPageSessionStorageKey("scrollPosition", { componentId: "myTable", includeSearch: true }))).toBe("50");

    window.history.replaceState({}, "", "/");
    rerender();
    expect(result.current.getScrollIndex()).toBe(100);
  });
});
