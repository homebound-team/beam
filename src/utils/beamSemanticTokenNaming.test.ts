import { describe, expect, it } from "vitest";
import { semanticLeafKeyToExpectedCssVar } from "../../scripts/token-naming";

describe("semanticLeafKeyToExpectedCssVar", () => {
  it("maps PascalCase to --b-kebab-case", () => {
    expect(semanticLeafKeyToExpectedCssVar("OnSurface")).toBe("--b-on-surface");
    expect(semanticLeafKeyToExpectedCssVar("PopoverSurface")).toBe("--b-popover-surface");
    expect(semanticLeafKeyToExpectedCssVar("SelectionIndicator")).toBe("--b-selection-indicator");
    expect(semanticLeafKeyToExpectedCssVar("FieldBorderFocus")).toBe("--b-field-border-focus");
    expect(semanticLeafKeyToExpectedCssVar("LoaderFill")).toBe("--b-loader-fill");
    expect(semanticLeafKeyToExpectedCssVar("OnSurfaceMuted")).toBe("--b-on-surface-muted");
    expect(semanticLeafKeyToExpectedCssVar("OnSurfaceSubtle")).toBe("--b-on-surface-subtle");
    expect(semanticLeafKeyToExpectedCssVar("SurfaceSubtle")).toBe("--b-surface-subtle");
    expect(semanticLeafKeyToExpectedCssVar("SurfaceSeparator")).toBe("--b-surface-separator");
    expect(semanticLeafKeyToExpectedCssVar("TextLabel")).toBe("--b-text-label");
    expect(semanticLeafKeyToExpectedCssVar("PrimaryHover")).toBe("--b-primary-hover");
    expect(semanticLeafKeyToExpectedCssVar("PrimaryPressed")).toBe("--b-primary-pressed");
    expect(semanticLeafKeyToExpectedCssVar("Danger")).toBe("--b-danger");
    expect(semanticLeafKeyToExpectedCssVar("ButtonGhostFg")).toBe("--b-button-ghost-fg");
    expect(semanticLeafKeyToExpectedCssVar("NavTextActive")).toBe("--b-nav-text-active");
  });
});
