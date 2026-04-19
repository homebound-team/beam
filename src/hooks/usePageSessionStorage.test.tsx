import { renderHook } from "@testing-library/react";
import { getPageSessionStorageKey, usePageSessionStorage } from "src/hooks/usePageSessionStorage";

describe("usePageSessionStorage", () => {
  beforeEach(() => {
    sessionStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  it("scopes keys to the current pathname by default", () => {
    window.history.replaceState({}, "", "/projects/123?filter=active");

    const { result } = renderHook(() => usePageSessionStorage("visibleColumns", "scheduleTable"));

    expect(result.current.key).toBe(getPageSessionStorageKey("visibleColumns", { componentId: "scheduleTable" }));
  });

  it("can include the current search string when requested", () => {
    window.history.replaceState({}, "", "/projects/123?filter=active");

    const { result } = renderHook(() => usePageSessionStorage("scrollPosition", "scheduleTable", { includeSearch: true }));

    expect(result.current.key).toBe(
      getPageSessionStorageKey("scrollPosition", { componentId: "scheduleTable", includeSearch: true }),
    );
  });

  it("reads and writes through the shared adapter", () => {
    const { result } = renderHook(() => usePageSessionStorage("visibleColumns", "scheduleTable"));

    result.current.setItem('{"name":false}');

    expect(sessionStorage.getItem(result.current.key)).toBe('{"name":false}');
    expect(result.current.getItem()).toBe('{"name":false}');
  });
});
