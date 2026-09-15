import { describe, expect, it } from "vitest";
import { defaultDocumentScrollRightPaneWidth, resolveWithRightPaneOptions } from "./withRightPane";

describe("resolveWithRightPaneOptions", () => {
  it("returns undefined when opted out", () => {
    // Given no / false withRightPane
    // Then both resolve to undefined
    expect(resolveWithRightPaneOptions(undefined)).toBeUndefined();
    expect(resolveWithRightPaneOptions(false)).toBeUndefined();
  });

  it("uses the default width for true and a custom width for a number", () => {
    // Given true or a px width
    // Then only width is resolved
    expect(resolveWithRightPaneOptions(true)).toEqual({ width: defaultDocumentScrollRightPaneWidth });
    expect(resolveWithRightPaneOptions(320)).toEqual({ width: 320 });
  });

  it("reads width from the object form", () => {
    // Given a partial or explicit width object
    // Then missing width falls back to the default
    expect(resolveWithRightPaneOptions({})).toEqual({ width: defaultDocumentScrollRightPaneWidth });
    expect(resolveWithRightPaneOptions({ width: 280 })).toEqual({ width: 280 });
  });
});
