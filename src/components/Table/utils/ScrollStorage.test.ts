import { renderHook } from "@testing-library/react";
import { ScrollStorage, useScrollStorage } from "src/components/Table/utils/ScrollStorage";

describe("ScrollStorage", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("generates a unique storage key based on pathname and tableId", () => {
    const storage = new ScrollStorage();
    storage.load("myTable");
    storage.save(42);
    expect(sessionStorage.getItem("scrollPosition_/_myTable")).toBe("42");
  });

  it("returns undefined when no saved position exists", () => {
    const storage = new ScrollStorage();
    const result = storage.load("myTable");
    expect(result).toBeUndefined();
  });

  it("returns the saved scroll position", () => {
    sessionStorage.setItem("scrollPosition_/_myTable", "100");
    const storage = new ScrollStorage();
    const result = storage.load("myTable");
    expect(result).toBe(100);
  });

  it("saves the scroll position to sessionStorage", () => {
    const storage = new ScrollStorage();
    storage.load("myTable");
    storage.save(50);
    expect(sessionStorage.getItem("scrollPosition_/_myTable")).toBe("50");
  });

  it("does not save if load was not called first", () => {
    const storage = new ScrollStorage();
    storage.save(50);
    // No key was set, so nothing should be saved
    expect(sessionStorage.length).toBe(0);
  });

  it("overwrites previous scroll position on save", () => {
    const storage = new ScrollStorage();
    storage.load("myTable");
    storage.save(10);
    storage.save(20);
    expect(sessionStorage.getItem("scrollPosition_/_myTable")).toBe("20");
  });
});

describe("useScrollStorage", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("returns undefined values when persistScrollPosition is false", () => {
    const { result } = renderHook(() => useScrollStorage(false, "myTable"));
    expect(result.current.scrollStorage).toBeUndefined();
    expect(result.current.initialScrollIndex).toBeUndefined();
  });

  it("returns a ScrollStorage instance when persistScrollPosition is true", () => {
    const { result } = renderHook(() => useScrollStorage(true, "myTable"));
    expect(result.current.scrollStorage).toBeInstanceOf(ScrollStorage);
  });

  it("returns undefined initialScrollIndex when no saved position exists", () => {
    const { result } = renderHook(() => useScrollStorage(true, "myTable"));
    expect(result.current.initialScrollIndex).toBeUndefined();
  });

  it("returns the saved initialScrollIndex", () => {
    sessionStorage.setItem("scrollPosition_/_myTable", "75");
    const { result } = renderHook(() => useScrollStorage(true, "myTable"));
    expect(result.current.initialScrollIndex).toBe(75);
  });

  it("memoizes the result based on persistScrollPosition and tableId", () => {
    const { result, rerender } = renderHook(({ persist, id }) => useScrollStorage(persist, id), {
      initialProps: { persist: true, id: "myTable" },
    });
    const firstResult = result.current;

    // Rerender with same props
    rerender({ persist: true, id: "myTable" });
    expect(result.current).toBe(firstResult);

    // Rerender with different tableId
    rerender({ persist: true, id: "otherTable" });
    expect(result.current).not.toBe(firstResult);
  });
});
