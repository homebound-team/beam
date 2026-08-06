import { restoreElementStyle, setInlineStyles, snapshotElementStyle } from "src/utils/inlineStyles";

describe("inlineStyles", () => {
  it("sets inline styles", () => {
    const el = document.createElement("div");
    const styles = { color: "red", zIndex: 2, "--x-test": "1" };

    setInlineStyles(el, styles);

    expect(el.style.color).toBe("red");
    expect(el.style.zIndex).toBe("2");
    expect(el.style.getPropertyValue("--x-test")).toBe("1");
  });

  it("ignores non-inline values", () => {
    const el = document.createElement("div");

    setInlineStyles(el, { color: "red", transform: undefined, nested: { opacity: 0 } });

    expect(el.style.color).toBe("red");
    expect(el.style.transform).toBe("");
    expect(el.getAttribute("style")).not.toContain("nested");
  });

  it("snapshots and restores an element's style and className", () => {
    const el = document.createElement("div");
    el.setAttribute("style", "color: red;");
    el.className = "original";

    const snapshot = snapshotElementStyle(el);

    // Mutate both further, as DnDGrid does during a drag
    el.style.position = "fixed";
    el.classList.add("active");

    restoreElementStyle(el, snapshot);

    expect(el.getAttribute("style")).toBe("color: red;");
    expect(el.className).toBe("original");
  });

  it("removes the style attribute entirely when restoring to an originally-unstyled element", () => {
    const el = document.createElement("div");
    const snapshot = snapshotElementStyle(el);

    el.style.position = "fixed";
    restoreElementStyle(el, snapshot);

    expect(el.hasAttribute("style")).toBe(false);
  });
});
