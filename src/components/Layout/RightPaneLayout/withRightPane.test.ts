import { beamLayoutViewportWidthVar, beamSideNavLayoutWidthVar } from "src/layouts/layoutVars";
import { describe, expect, it } from "vitest";
import {
  defaultDocumentScrollRightPaneWidth,
  minDocumentScrollMainWidthPx,
  readDocumentScrollChromeWidthPx,
  resolveOverlaySpacerWidthPx,
  resolveReserveScroll,
  resolveWithRightPaneOptions,
} from "./withRightPane";

describe("readDocumentScrollChromeWidthPx", () => {
  it("subtracts inherited side nav width from the viewport var", () => {
    const el = document.createElement("div");
    el.style.setProperty(beamLayoutViewportWidthVar, "1400px");
    el.style.setProperty(beamSideNavLayoutWidthVar, "260px");
    document.body.appendChild(el);

    expect(readDocumentScrollChromeWidthPx(el)).toBe(1140);
    el.remove();
  });
});

describe("resolveWithRightPaneOptions", () => {
  it("returns undefined when opted out", () => {
    // Given no / false withRightPane
    // Then both resolve to undefined
    expect(resolveWithRightPaneOptions(undefined, "auto")).toBeUndefined();
    expect(resolveWithRightPaneOptions(false, true)).toBeUndefined();
  });

  it("uses defaults for true and numeric width", () => {
    // Given true or a px width
    // Then width/reserveScroll follow the caller's default
    expect(resolveWithRightPaneOptions(true, "auto")).toEqual({
      width: defaultDocumentScrollRightPaneWidth,
      reserveScroll: "auto",
    });
    expect(resolveWithRightPaneOptions(320, true)).toEqual({ width: 320, reserveScroll: true });
  });

  it("merges object form with defaults", () => {
    // Given a partial object
    // Then missing width/reserveScroll fall back
    expect(resolveWithRightPaneOptions({ reserveScroll: false }, "auto")).toEqual({
      width: defaultDocumentScrollRightPaneWidth,
      reserveScroll: false,
    });
    expect(resolveWithRightPaneOptions({ width: 280 }, true)).toEqual({ width: 280, reserveScroll: true });
  });
});

describe("resolveReserveScroll", () => {
  it("returns true when reserveScroll is true regardless of leftover", () => {
    // Given an explicit spacer
    expect(
      resolveReserveScroll({
        reserveScroll: true,
        chromeWidthPx: 508,
        paneWidthPx: 450,
      }),
    ).toBe(true);
  });

  it("returns false when reserveScroll is false", () => {
    expect(
      resolveReserveScroll({
        reserveScroll: false,
        chromeWidthPx: 1400,
        paneWidthPx: 450,
      }),
    ).toBe(false);
  });

  it("auto returns false when leftover chrome is unusable", () => {
    // Given an iPad-Mini-portrait-with-nav-style leftover
    expect(
      resolveReserveScroll({
        reserveScroll: "auto",
        chromeWidthPx: 508,
        paneWidthPx: 450,
      }),
    ).toBe(false);
  });

  it("auto returns false at the boundary just below the min leftover", () => {
    expect(
      resolveReserveScroll({
        reserveScroll: "auto",
        chromeWidthPx: minDocumentScrollMainWidthPx + 450 - 1,
        paneWidthPx: 450,
      }),
    ).toBe(false);
  });

  it("auto returns true when leftover chrome is usable", () => {
    expect(
      resolveReserveScroll({
        reserveScroll: "auto",
        chromeWidthPx: minDocumentScrollMainWidthPx + 450,
        paneWidthPx: 450,
      }),
    ).toBe(true);
  });

  it("auto returns false when chrome width is unknown", () => {
    expect(
      resolveReserveScroll({
        reserveScroll: "auto",
        chromeWidthPx: 0,
        paneWidthPx: 450,
      }),
    ).toBe(false);
  });
});

describe("resolveOverlaySpacerWidthPx", () => {
  it("uses the full pane for reserveScroll true", () => {
    expect(
      resolveOverlaySpacerWidthPx({
        reserveScroll: true,
        chromeWidthPx: 1400,
        paneWidthPx: 450,
      }),
    ).toBe(450);
  });

  it("auto uses the full pane when leftover chrome is usable", () => {
    expect(
      resolveOverlaySpacerWidthPx({
        reserveScroll: "auto",
        chromeWidthPx: minDocumentScrollMainWidthPx + 450,
        paneWidthPx: 450,
      }),
    ).toBe(450);
  });

  it("auto returns 0 when leftover chrome is unusable", () => {
    expect(
      resolveOverlaySpacerWidthPx({
        reserveScroll: "auto",
        chromeWidthPx: 508,
        paneWidthPx: 450,
      }),
    ).toBe(0);
  });
});
