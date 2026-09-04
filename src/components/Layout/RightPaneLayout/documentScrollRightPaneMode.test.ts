import { beamLayoutViewportWidthVar, beamSideNavLayoutWidthVar } from "src/layouts/layoutVars";
import { describe, expect, it } from "vitest";
import {
  centeredShellCollidesWithPane,
  readDocumentScrollChromeWidthPx,
  resolveDocumentScrollRightPaneBehavior,
  resolveWithRightPaneOptions,
  toInlineRightPaneMode,
} from "./documentScrollRightPaneMode";
import { defaultDocumentScrollRightPaneWidth } from "./types";

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
    expect(resolveWithRightPaneOptions(false, "overlay")).toBeUndefined();
  });

  it("uses defaults for true and numeric width", () => {
    // Given true or a px width
    // Then width/mode follow the caller's default mode
    expect(resolveWithRightPaneOptions(true, "auto")).toEqual({
      width: defaultDocumentScrollRightPaneWidth,
      mode: "auto",
    });
    expect(resolveWithRightPaneOptions(320, "overlay")).toEqual({ width: 320, mode: "overlay" });
  });

  it("merges object form with defaults", () => {
    // Given a partial object
    // Then missing width/mode fall back
    expect(resolveWithRightPaneOptions({ mode: "push" }, "auto")).toEqual({
      width: defaultDocumentScrollRightPaneWidth,
      mode: "push",
    });
    expect(resolveWithRightPaneOptions({ width: 280 }, "overlay")).toEqual({ width: 280, mode: "overlay" });
  });
});

describe("centeredShellCollidesWithPane", () => {
  it("is false when a sm shell clears a 450px pane on a wide chrome", () => {
    // Given ~1920px chrome, 768px shell, 450px pane (needs chrome >= shell + 2*pane)
    // Then the centered shell clears the pane
    expect(centeredShellCollidesWithPane({ chromeWidthPx: 1920, paneWidthPx: 450, shellMaxPx: 768 })).toBe(false);
  });

  it("is true when the shell would sit under the pane", () => {
    // Given a typical laptop chrome where the centered 768 shell overlaps a 450 pane
    // Then collision is detected
    expect(centeredShellCollidesWithPane({ chromeWidthPx: 1400, paneWidthPx: 450, shellMaxPx: 768 })).toBe(true);
  });

  it("ignores jump links while the rail's mirrored margin keeps the shell page-centered", () => {
    // Given chrome wide enough (>= shell + 2 * rail) for the full mirror
    expect(centeredShellCollidesWithPane({ chromeWidthPx: 1700, paneWidthPx: 450, shellMaxPx: 768 })).toBe(false);

    // When the rail is shown
    // Then the form sits where it does without the rail, so the same chrome still clears
    expect(
      centeredShellCollidesWithPane({
        chromeWidthPx: 1700,
        paneWidthPx: 450,
        shellMaxPx: 768,
        jumpLinksWidthPx: 192,
      }),
    ).toBe(false);
  });

  it("accounts for jump links once the mirror has collapsed", () => {
    // Given a row too short for a full mirror, where the shell clears a narrow pane without the rail
    expect(centeredShellCollidesWithPane({ chromeWidthPx: 1100, paneWidthPx: 160, shellMaxPx: 768 })).toBe(false);

    // When the rail is shown and can no longer be mirrored
    // Then it shifts the form right into the pane
    expect(
      centeredShellCollidesWithPane({
        chromeWidthPx: 1100,
        paneWidthPx: 160,
        shellMaxPx: 768,
        jumpLinksWidthPx: 192,
      }),
    ).toBe(true);
  });
});

describe("toInlineRightPaneMode", () => {
  it("maps overlay and auto to auto", () => {
    expect(toInlineRightPaneMode("auto")).toBe("auto");
    expect(toInlineRightPaneMode("overlay")).toBe("auto");
  });

  it("preserves push", () => {
    expect(toInlineRightPaneMode("push")).toBe("push");
  });
});

describe("resolveDocumentScrollRightPaneBehavior", () => {
  it("returns push for explicit push mode regardless of chrome width", () => {
    // Given push mode on a tight chrome
    expect(
      resolveDocumentScrollRightPaneBehavior({
        mode: "push",
        chromeWidthPx: 800,
        paneWidthPx: 450,
        shellMaxPx: 768,
      }),
    ).toBe("push");
  });

  it("auto returns clear when the shell clears the pane", () => {
    // Given a wide chrome with no collision
    expect(
      resolveDocumentScrollRightPaneBehavior({
        mode: "auto",
        chromeWidthPx: 1920,
        paneWidthPx: 450,
        shellMaxPx: 768,
      }),
    ).toBe("clear");
  });

  it("auto returns clear with jump links when the mirrored rail leaves the shell clear", () => {
    // Given chrome where a left-only rail model would report a false collision
    expect(
      resolveDocumentScrollRightPaneBehavior({
        mode: "auto",
        chromeWidthPx: 1700,
        paneWidthPx: 450,
        shellMaxPx: 768,
        jumpLinksWidthPx: 192,
      }),
    ).toBe("clear");
  });

  it("auto returns push when colliding", () => {
    // Given collision on a typical laptop chrome
    expect(
      resolveDocumentScrollRightPaneBehavior({
        mode: "auto",
        chromeWidthPx: 1400,
        paneWidthPx: 450,
        shellMaxPx: 768,
      }),
    ).toBe("push");
  });

  it("auto returns push when colliding on tight chrome (narrow push, not mobile takeover)", () => {
    // Given collision with very little remaining width
    expect(
      resolveDocumentScrollRightPaneBehavior({
        mode: "auto",
        chromeWidthPx: 800,
        paneWidthPx: 450,
        shellMaxPx: 768,
      }),
    ).toBe("push");
  });

  it("auto uses push without shellMaxPx", () => {
    // Given auto without a centered shell size
    expect(
      resolveDocumentScrollRightPaneBehavior({
        mode: "auto",
        chromeWidthPx: 1920,
        paneWidthPx: 450,
      }),
    ).toBe("push");
  });
});
