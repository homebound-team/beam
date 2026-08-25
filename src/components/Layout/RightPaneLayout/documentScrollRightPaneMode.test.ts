import { describe, expect, it } from "vitest";
import {
  centeredShellCollidesWithPane,
  defaultMinPushContentWidthPx,
  resolveDocumentScrollRightPaneBehavior,
  resolveWithRightPaneOptions,
} from "./documentScrollRightPaneMode";
import { defaultDocumentScrollRightPaneWidth } from "./types";

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

  it("accounts for jump links width", () => {
    // Given chrome wide enough to clear without jump links
    expect(centeredShellCollidesWithPane({ chromeWidthPx: 1700, paneWidthPx: 450, shellMaxPx: 768 })).toBe(false);

    // When jump links shrink the form column
    // Then the same chrome collides
    expect(
      centeredShellCollidesWithPane({
        chromeWidthPx: 1700,
        paneWidthPx: 450,
        shellMaxPx: 768,
        jumpLinksWidthPx: 180,
      }),
    ).toBe(true);
  });
});

describe("resolveDocumentScrollRightPaneBehavior", () => {
  it("returns overlay and push for explicit modes", () => {
    // Given explicit modes
    // Then behavior matches regardless of chrome math
    expect(
      resolveDocumentScrollRightPaneBehavior({
        mode: "overlay",
        chromeWidthPx: 1400,
        paneWidthPx: 450,
        shellMaxPx: 768,
      }),
    ).toBe("overlay");
    expect(
      resolveDocumentScrollRightPaneBehavior({
        mode: "push",
        chromeWidthPx: 1400,
        paneWidthPx: 450,
        shellMaxPx: 768,
      }),
    ).toBe("push");
  });

  it("auto returns clear when the shell clears the pane", () => {
    // Given a wide chrome with no collision
    // Then auto skips the spacer
    expect(
      resolveDocumentScrollRightPaneBehavior({
        mode: "auto",
        chromeWidthPx: 1920,
        paneWidthPx: 450,
        shellMaxPx: 768,
      }),
    ).toBe("clear");
  });

  it("auto returns push when colliding but remaining width is enough", () => {
    // Given collision with remaining >= min push width
    const chromeWidthPx = 1400;
    const paneWidthPx = 450;
    const jumpLinksWidthPx = 0;
    const remaining = chromeWidthPx - jumpLinksWidthPx - paneWidthPx;
    expect(remaining).toBeGreaterThanOrEqual(defaultMinPushContentWidthPx);

    // Then auto pushes
    expect(
      resolveDocumentScrollRightPaneBehavior({
        mode: "auto",
        chromeWidthPx,
        paneWidthPx,
        shellMaxPx: 768,
        jumpLinksWidthPx,
      }),
    ).toBe("push");
  });

  it("auto returns overlay when colliding and remaining width is too tight", () => {
    // Given collision with remaining below the min push width
    const chromeWidthPx = 800;
    const paneWidthPx = 450;
    expect(chromeWidthPx - paneWidthPx).toBeLessThan(defaultMinPushContentWidthPx);

    // Then auto keeps overlay + spacer so content stays reachable
    expect(
      resolveDocumentScrollRightPaneBehavior({
        mode: "auto",
        chromeWidthPx,
        paneWidthPx,
        shellMaxPx: 768,
      }),
    ).toBe("overlay");
  });

  it("auto falls back to overlay without shellMaxPx", () => {
    // Given auto without a centered shell size (e.g. GridTable misuse)
    // Then behavior is the safe overlay default
    expect(
      resolveDocumentScrollRightPaneBehavior({
        mode: "auto",
        chromeWidthPx: 1920,
        paneWidthPx: 450,
      }),
    ).toBe("overlay");
  });
});
